# true-email-validator

A fully RFC 5322 and RFC 6531/6532 compliant email address validator.

## Install

```bash
npm i true-email-validator
```

## Usage

```javascript
import { validateEmail } from 'true-email-validator' // ESM
// const { validateEmail } = require('true-email-validator') // CJS

const input = [
  'john(an embedded comment)@foo.com', 
  'john@[123.123.123.123]' // domain literal notation not valid by default
]