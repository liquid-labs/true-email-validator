import { fqDomainNameRE, ipFormatRE, ipV6RE, localhostRE, tldNameRE } from 'regex-repo'

import * as emailBNF from './bnf/email.js'
import { validTLDs } from './valid-tlds'

const validateEmail = function (input, {
  allowComments = this?.allowComments || false,
  allowDomainLiteral = this?.allowDomainLiteral || false,
  allowIPV4 = this?.allowIPV4 || false,
  allowIPV6 = this?.allowIPV6 || false,
  allowLocalhost = this?.allowLocalhost || false,
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
  if (allowDomainLiteral !== true && domainLiteral !== undefined && domainLiteral !== undefined) {
    issues.push('contains disallowed domain literal')
  }
  if (allowIPV4 !== true && domain !== undefined && ipFormatRE.test(domain) == true) {
    issues.push('domain appears to be a disallowed IP address')
  }
  if (allowIPV4 !== true && domainLiteral !== undefined && ipFormatRE.test(domainLiteral) == true) {
    issues.push('domain literal appears to be a disallowed IP address')
  }
  if (allowIPV6 !== true && domainLiteral !== undefined && ipV6RE.test(domainLiteral) == true) {
    issues.push('domain literal appears to be a disallowed IPV6 address')
  }
  if (allowLocalhost !== true && domain !== undefined && localhostRE.test(domain.toLowerCase())) {
    issues.push('domain is disallowed localhost')
  }
  if (arbitraryTLDs !== true && domain !== undefined
    && (fqDomainNameRE.test(domain) || (tldNameRE.test(domain) && !localhostRE.test(domain)))) {
    const domainBits = domain.split('.')
    const tld = domainBits[domainBits.length - 1].toLowerCase()

    if (validTLDs[tld] !== true) {
      issues.push(`contains unknown TLD '${tld}'`)
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