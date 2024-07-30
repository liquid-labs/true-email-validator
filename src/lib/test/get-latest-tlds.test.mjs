import { getLatestTLDs } from '../get-latest-tlds'

const origFetch = fetch

describe('getLatestTLDs', () => {
  afterAll(() => {
    fetch = origFetch // eslint-disable-line no-global-assign
  })

  test('converts list to map', async () => {
    fetch = async () => { return { text : async () => 'FOO\nBAR\n' } } // eslint-disable-line no-global-assign

    const result = await getLatestTLDs()
    expect('foo' in result).toBe(true)
    expect('bar' in result).toBe(true)
  })

  test('ignores comments', async () => {
    // eslint-disable-next-line no-global-assign
    fetch = async () => { return { text : async () => '# comment\nFOO\nBAR\n' } }

    const result = await getLatestTLDs()
    expect('foo' in result).toBe(true)
    expect('bar' in result).toBe(true)
  })

  test('converts i18n/xn domains', async () => {
    fetch = async () => { return { text : async () => 'XN--11B4C3D' } } // eslint-disable-line no-global-assign

    const result = await getLatestTLDs()
    expect('कॉम' in result).toBe(true)
    expect('xn--11b4c3d' in result).toBe(true)
  })

  test('raises exception on non-OK status', async () => {
    fetch = async () => { return { ok : false, status : 500 } } // eslint-disable-line no-global-assign

    try {
      await getLatestTLDs()
      throw new Error('did not throw as expected')
    } catch (e) {
      expect(e.message).toMatch(/500/)
    }
  })
})
