import { ipRE, ipREString }

import { emailCommentRE, emailDisplayNameRE, emailDomainRE } from './lib/email-res'

const validateEmail = function (input, {
  allowComments = this?.allowComments || false,
  allowDisplayName = this?.allowDisplayName || false,
  allowDomainLiteral = this?.allowDomainLiteral || false,
  allowIPDomain = this?.allowIPDomain || false,
  allowIPV6 = this?.allowIPV6 || false,
  allowLocalhost = this?.allowLocalhost || false,
  arbitraryTLDs = this?.arbitraryTLDs || false,
  blacklistedChars = this?.blacklistedChars || '',
  domainBlackList = this?.domainBlackList || [],
  domainSpecificValidation = this?.domainSpecificValidation || false,
  noLengthCheck = this?.noLengthCheck || false,
  noTLDOnly = this?.noTLDOnly || false,
  noUTF8LocalPart = this?.noUTF8LocalPart || false,
  requireDisplayName = this?.requireDisplayName || false,
  strictTLDCheck = this?.strictTLDCheck || false
} = {}) {
  const baseRE = emailRE({ allowDisplayName, exact : true, requireDisplayName })

  const domain = input.match(emailDomainRE)?.[1]

  const localPart = input.match(emailLocalPartRE)?.[1]

  const reasons = []
  if (baseRE.test(input) === false) {
    reasons.push('input does not validate as a valid email')
    if (!input.contains('@')) {
      reasons[0] += "; looks like the '@' might be missing before the domain"
    }
    else if (domain === undefined && localPart === undefined) {
      reasons[0] += '; no local part (username) nor domain can be identified'
    }
    else if (domain !== undefined && localPart !== undefined) {
      throw new Error('Impossible outcome; both domain and local part were identified but the email ')
    }
    else if (domain === undefined) {
      reasons[0] += '; looks like domain may be malformed or missing'
    }
    else if (localPart === undefined) {
      reasons[0] += '; looks like the local part (username) may be malformed or missing'
    }

    return {
      valid : false,
      reasons
    }
  }
  // else



  const commentMatches = Array.from(input.matchAll(emailCommentRE))
  if (commentMatches.length > 0 && allowComments !== true) {
    reasons.push('is an otherwise valide email that includes disallowed comments')
  }
  const comments = 

  const possibleDisplayNames = Array.from(input.matchAll(emailDisplayNameRE))
  if (possibleDisplayNames.length > 0 && comments[0]?.[0] === possibleDisplayNames[0]) {
    possibleDisplayNames.shift()
  }
  const displayName = possibleDisplayNames[0]?.[0]
  if (display !== undefined && allowDisplayName !== true && requireDisplayName !== true) {
    reasons.push('is an otherwise valid email that contains disallowed display name')
  }
  if (displayName === undefined && requireDisplayName === true) {
    reasons.push('requires missing display name')
  }

  const possibleDomainLiterals = Array.from(input.matchAll(emailDomainLiteralRE))
  if (possibleDomainLiterals.length > 0 && comments[comments.length - 1]) {
    possibleDomainLiterals.pop()
  }
  const domainLiteral = possibleDomainLiterals[possibleDomainLiterals.length - 1]?.
  if (domainLiteral !== undefined && allowDomainLiteral !== true) {
    reasons.push('is an otherwise valid email that contains disallowed domain literal')
  }
  const literalDomainContent = input.matchAll(emailLiteralDomainContent)


  const isIPDomain = ipRE.test(domain) || new RegExp(ipREString).test(domainLiteral)
  if (isIPDomain === true && allowIPDomain !== true) {
    reasons.push('otherwise valid email has disallowed IP as the domain')
  }

  const isIPV6Domain = ipV6.test(domain)
}

export { validateEmail }