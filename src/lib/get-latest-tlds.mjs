import { toUnicode } from 'punycode/'

/**
 * Dynamically retrieves the latest list of valid TLDs from the Internet Assigned Numbers Authority (IANA).
 * International domains are decoded and both the decoded (international domain) and encoded ('xn--`) domain will be
 * present in the results object as both represent valid domains from a user's point of view.
 * @returns {Promise<object>} A Promise resolving to an object whose keys are valid domains; the value of each entry is
 *   `true`. ASCII characters are always lowercased, but the international domains are not transformed after decoding
 *   and may contain uppercase non-ASCII unicode characters per [RFC 4343](https://www.rfc-editor.org/rfc/rfc4343).
 */
const getLatestTLDs = async () => {
  const tldsListURL = 'https://data.iana.org/TLD/tlds-alpha-by-domain.txt'

  const response = await fetch(tldsListURL)
  if (response.ok === false) {
    throw new Error(`status: ${response.status}`)
  }
  const tldList = await response.text()

  const validTLDs = {}
  for (const tld of tldList.split('\n').map((tld) => tld.toLowerCase())) {
    if (tld.length > 0 && tld.startsWith('#') !== true) {
      if (tld.startsWith('xn--')) {
        const i18nTLD = toUnicode(tld.trim())
        validTLDs[i18nTLD] = true
      }
      validTLDs[tld.trim()] = true
    }
  }

  return validTLDs
}

export { getLatestTLDs }
