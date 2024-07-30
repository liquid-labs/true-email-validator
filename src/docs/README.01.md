# true-email-validator
[![coverage: 100%](./.readme-assets/coverage.svg)](https://github.com/liquid-labs/true-email-validator/pulls?q=is%3Apr+is%3Aclosed) [![Unit tests](https://github.com/liquid-labs/true-email-validator/actions/workflows/unit-tests-node.yaml/badge.svg)](https://github.com/liquid-labs/true-email-validator/actions/workflows/unit-tests-node.yaml)

A fully RFC 5322 and RFC 6531/6532 compliant email address validator.

The current version is well tested and can be used in production. The package is considered _beta_ because there are [additional features to be added](#todos) before the gold release.

## Install

```bash
npm i true-email-validator
```

## Usage

```javascript
import { validateEmail } from 'true-email-validator' // ESM
// const { validateEmail } = require('true-email-validator') // CJS

const inputs = [
  'john(an embedded comment)@foo.com', 
  '"weird@email"@foo.com,',
  'john@[123.123.123.123]', // domain literal notation not valid by default
  'just-not-an-email-address'
]

for (const input of inputs) {
  const result = validateEmail(inputs/*, { allowIPV4 : true } <- would allow the IPV4 domain literal */)
  if (result.isValid) {
    process.stdout.write(`${input} is valid`)
  }
  else {
    process.stdout.write(`${input} is invalid for the following reasons: ${result.issues.join(', ')}`)
  }
}
```
