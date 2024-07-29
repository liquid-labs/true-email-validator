import { fqDomainNameRE, ipHostRE, ipAddressRE, ipV6RE, localhostRE, tldNameRE } from 'regex-repo'

import * as emailBNF from './bnf/email.js'
import { validTLDs } from './valid-tlds'

/**
 * Validates an email address according to RFC 5322 (email messaging), RFC 6531/6532 (internationalized email), and RFC 
 * 5890 (internationalized domain names).
 * 
 * @param {string} input - The string or user input to validate as an email address.
 * @param {object} options - The validation options.
 * @param {boolean} options.allowComments - If true, allows embedded comments in the address like '(comment
 *   john@foo.com'. Note, the comments, if present, will be extracted regardless of this setting, the result `valid` 
 *   field will just be set false and an issue will be reported.
 * @param {boolean}options.allowAnyDomain - If true, then allows any syntactically valid domain value. Otherwise, the
 *   domain value is verified as recognizable as a domain name (as opposed to an IP address, for instance).
 * @param {boolean} options.allowAnyDomainLiteral - If true, allows any syntactically valid domain literal value that 
 *   is not a localhost address (unless `allowLocalhost` is also true). In general, domain literal values point to
 *   IPV4/6 addresses and the validation will (when `allowIP4` and/or`allowIPV6` are true), allow valid IP address 
 *   values but would reject other domain literal values, unless this value is set true. Note, if this value is true 
 *   then allowIPV4` and `allowIPV6` are essentially ignored.
 * @param {object} options.allowIPV4 -
 * @param {object} options.allowIPV6 -
 * @param {object} options.allowLocalhost - 
 * @param {object} options.allowedTLDs - 
 * @param {object} options.arbitraryTLDs - 
 * @param {object} options.excludeChars - 
 * @param {object} options.excludeDomains - 
 * @param {object} options.noDomainSpecificValidation - 
 * @param {object} options.noLengthCheck - 
 * @param {object} options.noTLDOnly - 
 * @param {object} options.noNonASCIILocalPart - 
 */
const validateEmail = function (input, {
  allowComments = this?.allowComments || false,
  allowAnyDomain = this?.allowAnyDomain || false,
  allowAnyDomainLiteral = this?.allowAnyDomainLiteral || false,
  allowIPV4 = this?.allowIPV4 || false,
  allowIPV6 = this?.allowIPV6 || false,
  allowLocalhost = this?.allowLocalhost || false,
  allowedTLDs = this?.allowedTLDs,
  arbitraryTLDs = this?.arbitraryTLDs || false,
  excludeChars = this?.excludeChars || [],
  excludeDomains = this?.excludeDomains || [],
  noDomainSpecificValidation = this?.noDomainSpecificValidation || false,
  noLengthCheck = this?.noLengthCheck || false,
  noTLDOnly = this?.noTLDOnly || false,
  noNonASCIILocalPart = this?.noNonASCIILocalPart || false
} = {}) {
  if (input === undefined || input === null) {
    return { valid: false, issues: ['is null or undefined'] }
  }
  else if (typeof input !== 'string') {
    return { valid: false, issues: ['is not type string'] }
  }

  const issues = []

  const addrSpec = emailBNF.Parse_Addr_spec(input).root
  if (addrSpec === undefined) {
    return { valid: false, issues: ['not recognized as a valid email address'] }
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
  }
  else {
    commentDomainPrefix = domainValue.value[0].value[0].value[0].value[0]?.value[0]?.value[1].value[1].value
    domainLiteral = domainValue.value[2].value
    commentDomainSuffix = domainValue.value[4].value[0].value[0].value[0]?.value[0]?.value[1].value[1].value
  }

  if (noLengthCheck !== true) {
    const usernameByteLength = (new TextEncoder()).encode(username).length
    if (usernameByteLength > 64) {
      issues.push(`the username/local part exceeds the maximum 64 bytes in length (${usernameByteLength} bytes)`)
    }
    const addressByteLength = (new TextEncoder()).encode(username + '@' + (domain ? domain : '[' + domainLiteral + ']')).length
    if (addressByteLength > 254) {
      // RFC 3696 says 320 characters, but RFC 5321 limits the forward/reverse path to 256, but that includes leading '<' 
      // and trailing '>', so effectively limits the address to 254
      issues.push(`the email address exceeds the maximum of 254 bytes in length (${addressByteLength} bytes)`)
    }
  }

  if (allowComments !== true 
    && (commentLocalPartPrefix !== undefined 
      || commentLocalPartSuffix !== undefined 
      || commentDomainPrefix !== undefined 
      || commentDomainSuffix !== undefined)) {
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
    if (allowAnyDomain !== true && ipAddressRE.test(domain)) {
      issues.push('domain appears to be an IPV4 address; must be a domain name or use domain literal')
      if (localhostRE.test(domain)) {
        issues.push('domain is disallowed localhost address')
      }
    } // it's not possible to have IPV6 looking domains because '::' is not allowed, so the email address will simply 
    // not be recognized
    else if (allowLocalhost !== true && localhostRE.test(domain.toLowerCase())) {
      issues.push('domain is disallowed localhost name')
    } else if (arbitraryTLDs !== true 
        && (fqDomainNameRE.test(domain) || (tldNameRE.test(domain) && !localhostRE.test(domain)))) {
      const domainBits = domain.split('.')
      const tld = domainBits[domainBits.length - 1].toLowerCase()
      allowedTLDs = allowedTLDs || validTLDs

      if ((Array.isArray(allowedTLDs) && !allowedTLDs.includes(tld)) 
        || (!Array.isArray(allowedTLDs) && !(tld in allowedTLDs))) {
        issues.push(`contains unknown TLD '${tld}'`)
      }
    }
  }
  
  if (excludeChars?.length > 0) {
    excludeChars = typeof excludeChars === 'string' ? excludeChars.split('') : excludeChars
    for (const char of excludeChars) {
      if (username.includes(char)) {
        issues.push(`contains excluded character '${char}'`)
      }
    }
  }
  if (excludeDomains?.length > 0) {
    for (const excludedDomain of excludeDomains) {
      if (domain?.endsWith(excludedDomain)) {
        issues.push('domain is excluded')
        break
      }
    }
  }
  if (noDomainSpecificValidation !== true && domain !== undefined) {
    if (domain.toLowerCase().endsWith('google.com')) {
      // https://support.google.com/a/answer/9193374; based on testing, these rules apply to aliases as well
      if (username.startsWith('"')) {
        issues.push('Google does not support quoted email addresses')
      }
      // Usernames can contain letters (a-z), numbers (0-9), dashes (-), underscores (_), apostrophes ('), and periods (.).
      else if (!(/^[a-z0-9_'.+-]+$/i).test(username)) {
        issues.push("Google email addresses may only contain letters (a-z), numbers (0-9), dashes (-), underscores (_), apostrophes ('), periods (.), and the plus sign (+) for plus addressing.")
      }
      // there are additional rules which are redundant or covered by RFC 5322 rules
    }
    else if (domain.toLowerCase().endsWith('hotmail.com')) {
      // https://answers.microsoft.com/en-us/outlook_com/forum/all/adding-characters-to-email-address/64fa77d4-c9b1-4420-b365-6b40f0bc06df
      if (username.startsWith('"')) {
        issues.push('Hotmail does not support quoted email addresses')
      }
      // Usernames can contain letters (a-z), numbers (0-9), dashes (-), underscores (_), apostrophes ('), and periods (.).
      else if (!(/^[a-z0-9_.+-]+$/i).test(username)) {
        issues.push("Hotmail email addresses may only contain letters (a-z), numbers (0-9), dashes (-), underscores (_), periods (.), and the plus sign (+) for plus addressing.")
      }
    }
    if (noTLDOnly === true && domain !== undefined && !domain.includes('.')) {
      issues.push('TLD only domains are not allowed')
    }
    if (noNonASCIILocalPart === true && domain !== undefined && (/[\u0080-\u{e007f}]/u).test(username)) {
      issues.push('non-ASCII characters are not allowed in the username (local part) of the address')
    }
  }

  return {
    valid : issues.length === 0,
    commentLocalPartPrefix,
    username,
    commentLocalPartSuffix,
    commentDomainPrefix,
    domain,
    domainLiteral,
    commentDomainSuffix,
    issues
  }
}

export { validateEmail }