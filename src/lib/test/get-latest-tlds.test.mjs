import fetch from 'node-fetch'

import { getLatestTLDs } from '../get-latest-tlds'

jest.mock('node-fetch', () => jest.fn())

describe('getLatestTLDs', () => {
  test('converts list to map', async () => {
    fetch.mockImplementation(async () => { return { text : async () => 'FOO\nBAR\n' } })

    const result = await getLatestTLDs()
    expect('foo' in result).toBe(true)
    expect('bar' in result).toBe(true)
  })

  test('ignores comments', async () => {
    fetch.mockImplementation(async () => { return { text : async () => '# comment\nFOO\nBAR\n' } })

    const result = await getLatestTLDs()
    expect('foo' in result).toBe(true)
    expect('bar' in result).toBe(true)
  })

  test('converts i18n/xn domains', async () => {
    fetch.mockImplementation(async () => { return { text : async () => 'XN--11B4C3D' } })

    const result = await getLatestTLDs()
    expect('कॉम' in result).toBe(true)
    expect('xn--11b4c3d' in result).toBe(true)
  })

  test('raises exception on non-OK status', async () => {
    fetch.mockImplementation(async () => { return { ok : false, status : 500 } })

    try {
      await getLatestTLDs()
      throw new Error('did not throw as expected')
    } catch (e) {
      expect(e.message).toMatch(/500/)
    }
  })
})
