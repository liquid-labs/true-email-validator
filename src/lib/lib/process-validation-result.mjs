const processValidationResult = (validationResult, origResult, type) => {
  if (validationResult !== true) {
    origResult.isValid = false
    if (typeof validationResult === 'string') {
      origResult.issues.push(validationResult)
    } else {
      origResult.issues.push(`failed custom ${type} validation`)
    }
  }

  return origResult
}

export { processValidationResult }
