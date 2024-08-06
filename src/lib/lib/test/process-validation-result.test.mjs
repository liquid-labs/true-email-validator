import { processValidationResult } from '../process-validation-result'

describe('processValidationResult', () => {
  test("returns original result if validation is 'true'", () => {
    const origResult = { isValid : true }
    expect(processValidationResult(true, origResult, 'test')).toBe(origResult)
  })

  test('returns orig with new issue if a string', () => {
    const issue = 'too cool for school'
    const origResult = { isValid : true, issues : [] }
    expect(processValidationResult(issue, origResult, 'test')).toEqual({ isValid : false, issues : [issue] })
  })

  test('inserts generic issue message of result is false', () => {
    const origResult = { isValid : true, issues : [] }
    expect(processValidationResult(false, origResult, 'test'))
      .toEqual({ isValid : false, issues : ['failed custom test validation'] })
  })
})
