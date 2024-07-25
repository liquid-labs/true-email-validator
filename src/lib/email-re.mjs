import { ipREString }

import { emailNoDisplayRE, emailOrDisplayRE, emailAndDisplayRE, emailComments } from './lib/email-res'

const emailRE = function ({
  allowDisplayName = this?.allowDisplayName || false,
  exact = this?.exact || false,
  requireDisplayName = this?.requireDisplayName || false
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

  return baseRE
}

export { emailRE }