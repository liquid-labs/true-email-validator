const validateEmail = funciton (email, {
  allowDisplayName = this?.allowDisplayName || false,
  allowIPDomain = this?.allowIPDomain || false,
  allowIPV6 = this?.allowIPV6 || false,
  allowLocalhost = this?.allowLocalhost || false,
  blacklistedChars = this?.blacklistedChars || '',
  domainBlackList = this?.domainBlackList || [],
  domainSpecificValidation = this?.domainSpecificValidation || false,
  noLengthCheck = this?.noLengthCheck || false,
  noUTF8LocalPart = this?.noUTF8LocalPart || false,
  requireDisplayName = this?.requireDisplayName || false,
  strictTLDCheck = this?.strictTLDCheck || false
}) {

}

export { validateEmail }