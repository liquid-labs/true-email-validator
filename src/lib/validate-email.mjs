import { domainLabelRE, ipHostRE, ipAddressRE, ipV6RE, localhostRE, tldNameRE } from 'regex-repo'

import * as emailBNF from './bnf/email'
import { processValidationResult } from './lib/process-validation-result'
import { validTLDs } from './valid-tlds'

/**
 * Email address parts and validation data.
 * @typedef {object} EmailData
 * @property {boolean} isValid - True if the input is a valid email address according to the options.
 * @property {string} address - The normalized email address. The domain portion, if any, will always be in lowercase (
 *   the `domain` property will preserve the original case).
 * @property {string} username - The username or local part of the email address.
 * @property {string|undefined} domain - The domain value, if present. Exactly one of `domain` and `domainLiteral` will
 *   always be defined for a syntactically valid email address. The original case of the domain is preserved.
 * @property {string|undefined} domainLiteral - The domain literal value, if present. Exactly one of `domain` and
 *   `domainLiteral` will always be defined for a syntactically valid email address.
 * @property {Array.<string>} issues - Lists the issues, if any, rendering the email invalid according to the effective
 *   validation options. At least one issue _should_ be present if `isValid` is false and the array _should_ be empty
 *   if `isValid` is true. This is guaranteed for the built in validation checks, but `validateResult` checks can cause
 *   a violation of this norm if the validation function is not correctly implemented.
 * @property {string|undefined} commentLocalPartPrefix - The embedded comment, if any, immediately before the address
 *   username (local part).
 * @property {string|undefined} commentLocalPartSuffix - The embedded comment, if any, immediately following the
 *   address username (local part).
 * @property {string|undefined} commentDomainPrefix - The embedded comment, if any, immediately before the domain or
 *   domain literal.
 * @property {string|undefined} commentDomainSuffix - The embedded comment, if any, immediately after the domain or
 *   domain literal.
 */

/**
 * Validates an email address according to RFC 5322 (email messaging), RFC 6531/6532 (internationalized email), and RFC
 * 5890 (internationalized domain names). Validation happens in two general steps. First, the input is parsed according
 * to the relevant RFC specifications. If this is successful, then the result will always contain a `username`,
 * `address`, and either `domain` or `domainLiteral` fields. If these are present, you know that the email was
 * successfully parsed. The second stage validates the parsed email components against the provided options or option
 * defaults. Therefore, you can have a situation where an email address is valid according to the specs and can be
 * parsed without an issue, but is still _invalid_ according to the effective options (or defaults).
 *
 * By default, the validation restricts possible features in the email address—such as comments and domain
 * literals—which are not normally wanted in basic email address. In particular, the default options:
 * - disallow embedded comments,
 * - disallow domain literal (IP addressing),
 * - disallow the 'localhost' domain,
 * - restricts possible TLDs to known good TLDs,
 * - restricts domain names to valid subdomain and TLDs based on DNS and ICANN rules beyond the email address
 * specification, and
 * - performs extra validation for known provider domains google.com and hotmail.com.
 *
 * Options can be explicitly defined to allow for a more liberal or restrictive validation.
 * @param {string} input - The string or user input to validate as an email address.
 * @param {object} options - The validation options.
 * @param {boolean} options.allowComments - If true, allows embedded comments in the address like '(comment)
 *   john@foo.com', which are disallowed by default. Note, the comments, if present, will be extracted regardless of
 *   this setting, the result `valid` field will just be set false and an issue will be reported.
 * @param {boolean}options.allowAnyDomain - If true, then overrides all default restrictions and format checks of the
 *   domain value and allows any syntactically valid domain value except a localhost name or address (unless
 *   `allowLocalHost` is also set true). Note that impossible sub-domain labels (e.g., a label more than 63 characters
 *   long or a single digit) or TLDs (e.g. '123') will still trigger an invalid result. Otherwise, the domain value is
 *   verified as recognizable as a domain name (as opposed to an IP address, for instance).
 * @param {boolean} options.allowAnyDomainLiteral - If true, then overrides default restrictions and format checks of
 *   domain literal values and allows any syntactically valid domain literal value that is not a localhost address (
 *   unless `allowLocalhost` is also true). In general, domain literal values point to IPV4/6 addresses and the
 *   validation will (when `allowIP4` and/or`allowIPV6` are true), allow valid IP address values but would reject other
 *   domain literal values, unless this value is set true. Note, if this value is true then allowIPV4` and `allowIPV6`
 *   are essentially ignored.
 * @param {boolean} options.allowIPV4 - Allows IPV4 domain literal values. Note that any loopback address will still
 *   cause a validation error unless `allowLocalHost` is also set true. See `allowAnyDomainLiteral`, `allowIPV6`, and
 *  `allowLocahost`.`
 * @param {boolean} options.allowIPV6 - Allows IPV6 domain literal values. Note that the localhost address will still
 *   cause a validation error unless `allowLocaHost` is also set true. See `allowAnyDomainLiteral`, `allowIPV4`, and
 *  `allowLocahost`.`
 * @param {boolean} options.allowLocalhost - Allows `localhost` domain value or (when `allowIPV6` and/or `allowIPV4`
 *   also set true) loopback IP addresses.
 * @param {object<string,true>} options.allowedTLDs - By default, the TLD portion of a domain name will be validated 
 *   against known good TLDs. To limit this list or use an updated list, set this value to an array of acceptable TLDs 
 *   or a map with valid TLD keys (the value is not used). You can use the `getLatestTLDs`, also exported by this 
 *   package, to get an object defining the most current TLDs as registered with ICANN. See `arbitraryTLDs`.
 * @param {boolean} options.allowQuotedLocalPart - Overrides default restriction and allows quoted username/local parts.
 * @param {boolean} options.arbitraryTLDs - Skips the 'known TLD' check and allows any validly formatted TLD name. This
 *   is still restricted by the TLD name restrictions which are tighter than standard domain labels.
 * @param {boolean} options.excludeChars - Either a string or array of excluded characters. In the array form, it will
 *   match the whole string, so you can also use this to exclude specific character sequences.
 * @param {boolean} options.excludeDomains - An array of domains to exclude. Excluding a domain also excludes all
 *   subdomains so eclxuding 'foo.com' would exclude 'john@foo.com' and 'john@bar.foo.com'. Initial periods are ignored
 *   so `excludeDomains: ['com']', and `excludeDomains: ['.com']` are equivalent.
 * @param {boolean} options.noDomainSpecificValidation - Setting this to true will skip domain specific validations. By
 *   default, the validation includes domain specific checks for 'google.com' and 'hotmail.com' domains. These domains
 *   are known to have more restrictive policies regarding what is and is not a valid email address.
 * @param {boolean} options.noLengthCheck - If true, then skips username (local part) and total email address length
 *   restrictions. Note that domain name label lengths are still enforced.
 * @param {boolean} options.noPlusEmails - If true, then '+' is not allowed in the username/local part. This is
 *   equivalent to setting `excludeChars = '+'.`
 * @param {boolean} options.noTLDOnly - If true, then disallows TLD only domains in an address like 'john@com'.
 * @param {boolean} options.noNonASCIILocalPart - If true, then disallows non-ASCII/international characters in the
 *   username/local part of the address.
 * @param {Function} options.validateInput - A function to perform additional, arbitrary validation on a syntactically
 *   valid input string. This function is provided mainly to support input validation libraries where the input is not
 *   recoverable from the processed value. In general, users should prefer `validateResult`. The inputs two the
 *   function are the input string and the original options to this function. The function must return `true` if the
 *   validation check passes. Any other result is indicative of failure. If the result is a string, then that is
 *   understood to be a description of the problem and it's pushed onto the `EmailData` `issues` list. Otherwise, a
 *   generic 'custom validation failed' message is pushed onto the `issues` list.
 * @param {Function} options.validateResult - A function to perform additional, arbitrary validation on a syntactically
 *   valid email address result. The function should expect two arguments: [`EmailData`](#EmailData) argument which is
 *   the result off all other built in validations and any `validateInput` result (`validateResult` is the last check
 *   performed) and a second argument which is the options originally passed into this func. Note, if the input was not
 *   recognized as an email address to begin with, then `validateResult` is not invoked. The function may return a
 *   modified or replacement [`EmailData`](#EmailData) object (any object defining the required fields is recognized as
 *   an `EmailData` result object). In this case, the function is responsible for setting `EmailData` `isValid` and
 *   `issues` fields as appropriate. Otherwise, a return value of `true` is taken to indicate the validation succeeded.
 *   Any other value is treated as a value and `isValid` will be set to `false`. If the result is a string, thin it's
 *   understood as a description of the issue and is pushed to the `issues` list. Otherwise, a generic 'custom
 *   validation failed' message is pushed to the `issues` list.
 * @returns {EmailData} The results of the validation.
 */ // Note, the  '1)', '2)', etc. above will be in-lined and won't show up as a list
const validateEmail = function (input, options = this || {}) {
  if (input === undefined || input === null) {
    return { isValid : false, issues : ['is null or undefined'] }
  } else if (typeof input !== 'string') {
    return { isValid : false, issues : ['is not type string'] }
  }

  const {
    allowComments = false,
    allowAnyDomain = false,
    allowAnyDomainLiteral = false,
    allowIPV4 = false,
    allowIPV6 = false,
    allowLocalhost = false,
    allowQuotedLocalPart = false,
    arbitraryTLDs = false,
    excludeDomains = [],
    noDomainSpecificValidation = false,
    noLengthCheck = false,
    noPlusEmails = false,
    noTLDOnly = false,
    noNonASCIILocalPart = false,
    validateInput,
    validateResult
  } = options
  let { allowedTLDs, excludeChars = [] } = options

  const issues = []

  const parseResult = emailBNF.Parse_Addr_spec(input)
  const { root: addrSpec, isPartial } = parseResult
  if (addrSpec === undefined) {
    return { isValid : false, issues : ['not recognized as a valid email address'] }
  } else if (isPartial === true) {
    return {
      isValid : false,
      issues  : ["parsed as a 'partial' address; perhaps you need double quotes (\") around the username (local part)"]
    }
  }
  // else

  const localPartValue = addrSpec.value[0].value[0]
  const commentLocalPartPrefix = localPartValue.value[0].value[0].value[0].value[0]?.value[0]?.value[1].value[1].value
  const username = localPartValue.value[1].value
  const commentLocalPartSuffix = localPartValue.value[2].value[0].value[0].value[0]?.value[0]?.value[1].value[1].value

  const domainValue = addrSpec.value[2].value[0]
  let commentDomainSuffix, domain, domainLiteral, commentDomainPrefix
  if (domainValue.type === 'dot_atom') {
    commentDomainPrefix = domainValue.value[0].value[0].value[0].value[0]?.value[0]?.value[1].value[1].value
    domain = domainValue.value[1].value
    commentDomainSuffix = domainValue.value[2].value[0].value[0].value[0]?.value[0]?.value[1].value[1].value
  } else {
    commentDomainPrefix = domainValue.value[0].value[0].value[0].value[0]?.value[0]?.value[1].value[1].value
    domainLiteral = domainValue.value[2].value
    commentDomainSuffix = domainValue.value[4].value[0].value[0].value[0]?.value[0]?.value[1].value[1].value
  }

  if (noLengthCheck !== true) {
    const usernameByteLength = (new TextEncoder()).encode(username).length
    if (usernameByteLength > 64) {
      issues.push(`the username/local part exceeds the maximum 64 bytes in length (${usernameByteLength} bytes)`)
    }
    const addressByteLength = (new TextEncoder()).encode(username + '@' + (domain || '[' + domainLiteral + ']')).length
    if (addressByteLength > 254) {
      // RFC 3696 says 320 characters, but RFC 5321 limits the forward/reverse path to 256, but that includes leading '<'
      // and trailing '>', so effectively limits the address to 254
      issues.push(`the email address exceeds the maximum of 254 bytes in length (${addressByteLength} bytes)`)
    }
  }

  if (allowComments !== true &&
    (commentLocalPartPrefix !== undefined ||
      commentLocalPartSuffix !== undefined ||
      commentDomainPrefix !== undefined ||
      commentDomainSuffix !== undefined)) {
    issues.push('contains disallowed comment(s)')
  }
  if (domainLiteral !== undefined) {
    if (allowAnyDomainLiteral !== true && (allowIPV4 === true || allowIPV6 === true)) {
      let test, validDescription
      if (allowIPV6 !== true) { // then allowIPV4 must be true
        test = (value) => ipAddressRE.test(value)
        validDescription = 'IPV4'
      } else if (allowIPV4 !== true) {
        test = (value) => ipV6RE.test(value)
        validDescription = 'IPV6'
      } else { // both allowIPV4 and allowIPV6 must be true
        test = (value) => ipAddressRE.test(value) || ipV6RE.test(value)
        validDescription = 'IP'
      }

      if (test(domainLiteral) !== true) {
        issues.push(`domain literal is not a valid ${validDescription} address`)
      } else if (ipAddressRE.test(domainLiteral) === true && ipHostRE.test(domainLiteral) !== true) {
        issues.push('domain literal is in the format of an IPV4 address, but specifies a non-host address (such as a broadcast address)')
      } else if (allowLocalhost !== true && localhostRE.test(domainLiteral)) {
        issues.push('domain literal is disallowed localhost address')
      }
    } else if (allowAnyDomainLiteral === true && allowLocalhost !== true && localhostRE.test(domainLiteral)) {
      issues.push('domain literal is disallowed localhost address or name')
    } else if (allowAnyDomainLiteral !== true) {
      issues.push('contains disallowed domain literal')
    }
  } else { // then since the email address is recognized, domain must be defined
    if (excludeDomains?.length > 0) {
      for (const excludedDomain of excludeDomains) {
        const dottedDomain = excludedDomain.startsWith('.') ? excludedDomain : '.' + excludedDomain
        if (('.' + domain).endsWith(dottedDomain.toLowerCase())) {
          issues.push(`domain '*${dottedDomain}' is excluded`)
          break
        }
      }
    }

    const domainBits = domain.split('.')
    const tld = domainBits[domainBits.length - 1].toLowerCase()

    if (allowAnyDomain !== true && ipAddressRE.test(domain)) {
      issues.push('domain appears to be an IPV4 address; must be a domain name or use domain literal')
      if (localhostRE.test(domain)) {
        issues.push('domain is disallowed localhost address')
      }
    } else if (allowLocalhost !== true && localhostRE.test(domain.toLowerCase())) {
      // it's not possible to have IPV6 looking domains because '::' is not allowed, so the email address will simply
      // not be recognized
      issues.push('domain is disallowed localhost name')
    } else if (localhostRE.test(domain) !== true && ipAddressRE.test(domain) !== true) {
      if (arbitraryTLDs !== true) {
        allowedTLDs = allowedTLDs || validTLDs

        if ((Array.isArray(allowedTLDs) && !allowedTLDs.includes(tld)) ||
          (!Array.isArray(allowedTLDs) && !(tld in allowedTLDs))) {
          issues.push(`contains unknown TLD '${tld}'`)
        }
      }

      if (tldNameRE.test(tld) !== true) {
        issues.push('top-level domain does not adhere to TLD naming restrictions')
      }
      const subdomains = domainBits
      for (const domainLabel of subdomains) {
        if (domainLabelRE.test(domainLabel) !== true) {
          issues.push(`domain label '${domainLabel}' is not valid`)
        }
      }
    }
  }

  if (allowQuotedLocalPart !== true && username.startsWith('"')) {
    issues.push('uses disallowed quoted username/local part')
  }
  if (excludeChars?.length > 0 || noPlusEmails === true) {
    excludeChars = typeof excludeChars === 'string' ? excludeChars.split('') : excludeChars
    if (noPlusEmails === true) {
      excludeChars.push('+')
    }
    for (const char of excludeChars) {
      if (username.includes(char)) {
        issues.push(`contains excluded character ${char.length > 1 ? 'sequence ' : ''}'${char}' in username`)
      }
    }
  }
  if (noDomainSpecificValidation !== true && domain !== undefined) {
    if (('.' + domain).toLowerCase().endsWith('.google.com')) {
      // https://support.google.com/a/answer/9193374; based on testing, these rules apply to aliases as well
      if (username.startsWith('"')) {
        issues.push('Google does not support quoted email addresses')
      } else if (!(/^[a-z0-9_'.+-]+$/i).test(username)) {
        // Usernames can contain letters (a-z), numbers (0-9), dashes (-), underscores (_), apostrophes ('), and
        // periods (.).
        issues.push("Google email addresses may only contain letters (a-z), numbers (0-9), dashes (-), underscores (_), apostrophes ('), periods (.), and the plus sign (+) for plus addressing.")
      }
      // there are additional rules which are redundant or covered by RFC 5322 rules
    } else if (('.' + domain).toLowerCase().endsWith('.hotmail.com')) {
      // https://answers.microsoft.com/en-us/outlook_com/forum/all/adding-characters-to-email-address/64fa77d4-c9b1-4420-b365-6b40f0bc06df
      if (username.startsWith('"')) {
        issues.push('Hotmail does not support quoted email addresses')
      } else if (!(/^[a-z0-9_.+-]+$/i).test(username)) {
        // Usernames can contain letters (a-z), numbers (0-9), dashes (-), underscores (_), apostrophes ('), and
        // periods (.).
        issues.push('Hotmail email addresses may only contain letters (a-z), numbers (0-9), dashes (-), underscores (_), periods (.), and the plus sign (+) for plus addressing.')
      }
    }
    if (noTLDOnly === true && domain !== undefined && !domain.includes('.')) {
      issues.push('TLD only domains are not allowed')
    }
    if (noNonASCIILocalPart === true && domain !== undefined && (/[\u0080-\u{e007f}]/u).test(username)) {
      issues.push('non-ASCII characters are not allowed in the username (local part) of the address')
    }
  }

  let result = {
    isValid : issues.length === 0,
    address : `${username}@${domain?.toLowerCase() || '[' + domainLiteral + ']'}`,
    commentLocalPartPrefix,
    username,
    commentLocalPartSuffix,
    commentDomainPrefix,
    domain,
    domainLiteral,
    commentDomainSuffix,
    issues
  }

  if (validateInput !== undefined) {
    const validationResult = validateInput(input, options)
    result = processValidationResult(validationResult, result, 'input')
  }
  if (validateResult !== undefined) {
    const validationResult = validateResult(result, options)
    if (validationResult !== null && // 'null' has typeof 'object'
        typeof validationResult === 'object' &&
        validationResult.isValid !== undefined &&
        validationResult.address !== undefined &&
        validationResult.issues !== undefined &&
        (validationResult.domain !== undefined || validationResult.domainLiteral !== undefined)
    ) {
      result = validationResult
    } else {
      result = processValidationResult(validationResult, result, 'result')
    } // else validationResult === undefined, which means we expect the original result to be modified
  }

  return result
}

export { validateEmail }
