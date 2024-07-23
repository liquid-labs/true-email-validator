import { emailNoDisplayRE, emailOrDisplayRE, emailAndDisplayRE } from './lib/email-res'

const emailRE = function ({
x  allowDisplayName = this?.allowDisplayName || false,
x  allowIPDomain = this?.allowIPDomain || false,
  allowIPLiteral = this?.allowIPLiteral || false,
  allowIPV6 = this?.allowIPV6 || false,
  allowLocalhost = this?.allowLocalhost || false,
  arbitraryTLDs = this?.arbitraryTLDs || false,
  blacklistedChars = this?.blacklistedChars || '',
  domainBlackList = this?.domainBlackList || [],
x  exact = this?.exact || false,
  noLengthCheck = this?.noLengthCheck || false,
  noTLDOnly = this?.noTLDOnly || false,
  noUTF8LocalPart = this?.noUTF8LocalPart || false,
x  requireDisplayName = this?.requireDisplayName || false,
  returnString = this?.returnString || false,
  strictTLDCheck = this?.strictTLDCheck || false
} = {}) {
  /*
    Strategy: generate three base REs, 'match every valid email', 'match valid email with display name', and 'match 
    valid email with or without display name'. We use `allowDisplayName`` and `requireDisplayName` options to select 
    which of the base REs we choose. We then include REs to enforce the other selections.
  */
  let baseRE = requireDisplayName === true
    ? emailAndDisplayRE
    : allowDisplayName === true
      ? emailOrDisplayRE
      : emailNoDisplayRE

  if (exact === true) {
    baseRE = new RegExp(`^${baseRE.toString().slice(1, -1)}$`)
  }

  const res = [[baseRE, 'does not match basic email']]

  
}

export { emailRE }