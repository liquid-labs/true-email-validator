import { toUnicode } from 'punycode/'

const getTLDs = async () => {
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
      else {
        validTLDs[tld.trim()] = true
      }
    }
  }

  return validTLDs
}

export { getTLDs }