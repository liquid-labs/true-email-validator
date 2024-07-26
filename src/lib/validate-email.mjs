import { ipRE } from 'regex-repo'

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

}

export { validateEmail }