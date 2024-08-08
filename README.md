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

##  API Reference
_API generated with [dmd-readme-api](https://www.npmjs.com/package/dmd-readme-api)._

- Functions:
  - [`getLatestTLDs()`](#getLatestTLDs): Dynamically retrieves the latest list of valid TLDs from the Internet Assigned Numbers Authority (IANA).
  - [`validateEmail()`](#validateEmail): Validates an email address according to RFC 5322 (email messaging), RFC 6531/6532 (internationalized email), and RFC
5890 (internationalized domain names).
- Typedefs:
  - [`EmailData`](#EmailData): Email address parts and validation data.

<a id="getLatestTLDs"></a>
### `getLatestTLDs()` ⇒ `Promise.<object>`

Dynamically retrieves the latest list of valid TLDs from the Internet Assigned Numbers Authority (IANA).
International domains are decoded and both the decoded (international domain) and encoded ('xn--`) domain will be
present in the results object as both represent valid domains from a user's point of view.

**Returns**: `Promise.<object>` - A Promise resolving to an object whose keys are valid domains; the value of each entry is
  `true`. ASCII characters are always lowercased, but the international domains are not transformed after decoding
  and may contain uppercase non-ASCII unicode characters per [RFC 4343](https://www.rfc-editor.org/rfc/rfc4343).


[**Source code**](./src/lib/get-latest-tlds.mjs#L12)

<a id="validateEmail"></a>
### `validateEmail(input, options)` ⇒ [`EmailData`](#EmailData)

Validates an email address according to RFC 5322 (email messaging), RFC 6531/6532 (internationalized email), and RFC
5890 (internationalized domain names). Validation happens in two general steps. First, the input is parsed according
to the relevant RFC specifications. If this is successful, then the result will always contain a `username`,
`address`, and either `domain` or `domainLiteral` fields. If these are present, you know that the email was
successfully parsed. The second stage validates the parsed email components against the provided options or option
defaults. Therefore, you can have a situation where an email address is valid according to the specs and can be
parsed without an issue, but is still _invalid_ according to the effective options (or defaults).

By default, the validation restricts possible features in the email address—such as comments and domain
literals—which are not normally wanted in basic email address. In particular, the default options:
- disallow embedded comments,
- disallow domain literal (IP addressing),
- disallow the 'localhost' domain,
- restricts possible TLDs to known good TLDs,
- restricts domain names to valid subdomain and TLDs based on DNS and ICANN rules beyond the email address
specification, and
- performs extra validation for known provider domains google.com and hotmail.com.

Options can be explicitly defined to allow for a more liberal or restrictive validation.


| Param | Type | Description |
| --- | --- | --- |
| input | `string` | The string or user input to validate as an email address. |
| options | `object` | The validation options. |
| options.allowComments | `boolean` | If true, allows embedded comments in the address like '(comment)   john@foo.com', which are disallowed by default. Note, the comments, if present, will be extracted regardless of   this setting, the result `valid` field will just be set false and an issue will be reported. |
| options.allowAnyDomain | `boolean` | If true, then overrides all default restrictions and format checks of the   domain value and allows any syntactically valid domain value except a localhost name or address (unless   `allowLocalHost` is also set true). Note that impossible sub-domain labels (e.g., a label more than 63 characters   long or a single digit) or TLDs (e.g. '123') will still trigger an invalid result. Otherwise, the domain value is   verified as recognizable as a domain name (as opposed to an IP address, for instance). |
| options.allowAnyDomainLiteral | `boolean` | If true, then overrides default restrictions and format checks of   domain literal values and allows any syntactically valid domain literal value that is not a localhost address (   unless `allowLocalhost` is also true). In general, domain literal values point to IPV4/6 addresses and the   validation will (when `allowIP4` and/or`allowIPV6` are true), allow valid IP address values but would reject other   domain literal values, unless this value is set true. Note, if this value is true then allowIPV4` and `allowIPV6`   are essentially ignored. |
| options.allowIPV4 | `boolean` | Allows IPV4 domain literal values. Note that any loopback address will still   cause a validation error unless `allowLocalHost` is also set true. See `allowAnyDomainLiteral`, `allowIPV6`, and  `allowLocahost`.` |
| options.allowIPV6 | `boolean` | Allows IPV6 domain literal values. Note that the localhost address will still   cause a validation error unless `allowLocaHost` is also set true. See `allowAnyDomainLiteral`, `allowIPV4`, and  `allowLocahost`.` |
| options.allowLocalhost | `boolean` | Allows `localhost` domain value or (when `allowIPV6` and/or `allowIPV4`   also set true) loopback IP addresses. |
| options.allowedTLDs | `object.<string, true>` | By default, the TLD portion of a domain name will be validated    against known good TLDs. To limit this list or use an updated list, set this value to an array of acceptable TLDs    or a map with valid TLD keys (the value is not used). You can use the `getLatestTLDs`, also exported by this    package, to get an object defining the most current TLDs as registered with ICANN. See `arbitraryTLDs`. |
| options.allowQuotedLocalPart | `boolean` | Overrides default restriction and allows quoted username/local parts. |
| options.arbitraryTLDs | `boolean` | Skips the 'known TLD' check and allows any validly formatted TLD name. This   is still restricted by the TLD name restrictions which are tighter than standard domain labels. |
| options.excludeChars | `boolean` | Either a string or array of excluded characters. In the array form, it will   match the whole string, so you can also use this to exclude specific character sequences. |
| options.excludeDomains | `boolean` | An array of domains to exclude. Excluding a domain also excludes all   subdomains so eclxuding 'foo.com' would exclude 'john@foo.com' and 'john@bar.foo.com'. Initial periods are ignored   so `excludeDomains: ['com']', and `excludeDomains: ['.com']` are equivalent. |
| options.noDomainSpecificValidation | `boolean` | Setting this to true will skip domain specific validations. By   default, the validation includes domain specific checks for 'google.com' and 'hotmail.com' domains. These domains   are known to have more restrictive policies regarding what is and is not a valid email address. |
| options.noLengthCheck | `boolean` | If true, then skips username (local part) and total email address length   restrictions. Note that domain name label lengths are still enforced. |
| options.noPlusEmails | `boolean` | If true, then '+' is not allowed in the username/local part. This is   equivalent to setting `excludeChars = '+'.` |
| options.noTLDOnly | `boolean` | If true, then disallows TLD only domains in an address like 'john@com'. |
| options.noNonASCIILocalPart | `boolean` | If true, then disallows non-ASCII/international characters in the   username/local part of the address. |
| options.validateInput | `function` | A function to perform additional, arbitrary validation on a syntactically   valid input string. This function is provided mainly to support input validation libraries where the input is not   recoverable from the processed value. In general, users should prefer `validateResult`. The inputs two the   function are the input string and the original options to this function. The function must return `true` if the   validation check passes. Any other result is indicative of failure. If the result is a string, then that is   understood to be a description of the problem and it's pushed onto the `EmailData` `issues` list. Otherwise, a   generic 'custom validation failed' message is pushed onto the `issues` list. |
| options.validateResult | `function` | A function to perform additional, arbitrary validation on a syntactically   valid email address result. The function should expect two arguments: [`EmailData`](#EmailData) argument which is   the result off all other built in validations and any `validateInput` result (`validateResult` is the last check   performed) and a second argument which is the options originally passed into this func. Note, if the input was not   recognized as an email address to begin with, then `validateResult` is not invoked. The function may return a   modified or replacement [`EmailData`](#EmailData) object (any object defining the required fields is recognized as   an `EmailData` result object). In this case, the function is responsible for setting `EmailData` `isValid` and   `issues` fields as appropriate. Otherwise, a return value of `true` is taken to indicate the validation succeeded.   Any other value is treated as a value and `isValid` will be set to `false`. If the result is a string, thin it's   understood as a description of the issue and is pushed to the `issues` list. Otherwise, a generic 'custom   validation failed' message is pushed to the `issues` list. |

**Returns**: [`EmailData`](#EmailData) - The results of the validation.


[**Source code**](./src/lib/validate-email.mjs#L118)

<a id="EmailData"></a>
### `EmailData` : `object`

Email address parts and validation data.


**Properties**

| Name | Type | Description |
| --- | --- | --- |
| isValid | `boolean` | True if the input is a valid email address according to the options. |
| address | `string` | The normalized email address. The domain portion, if any, will always be in lowercase (   the `domain` property will preserve the original case). |
| username | `string` | The username or local part of the email address. |
| domain | `string` \| `undefined` | The domain value, if present. Exactly one of `domain` and `domainLiteral` will   always be defined for a syntactically valid email address. The original case of the domain is preserved. |
| domainLiteral | `string` \| `undefined` | The domain literal value, if present. Exactly one of `domain` and   `domainLiteral` will always be defined for a syntactically valid email address. |
| issues | `Array.<string>` | Lists the issues, if any, rendering the email invalid according to the effective   validation options. At least one issue _should_ be present if `isValid` is false and the array _should_ be empty   if `isValid` is true. This is guaranteed for the built in validation checks, but `validateResult` checks can cause   a violation of this norm if the validation function is not correctly implemented. |
| commentLocalPartPrefix | `string` \| `undefined` | The embedded comment, if any, immediately before the address   username (local part). |
| commentLocalPartSuffix | `string` \| `undefined` | The embedded comment, if any, immediately following the   address username (local part). |
| commentDomainPrefix | `string` \| `undefined` | The embedded comment, if any, immediately before the domain or   domain literal. |
| commentDomainSuffix | `string` \| `undefined` | The embedded comment, if any, immediately after the domain or   domain literal. |

[**Source code**](./src/lib/validate-email.mjs#L7)

## TODOs

There are two major additions we plan to add before the gold release.

1. [Adding support for name + address style inputs.](https://github.com/liquid-labs/true-email-validator/issues/2)
2. [Implement a `validate-email` CLI tool.](https://github.com/liquid-labs/true-email-validator/issues/3)