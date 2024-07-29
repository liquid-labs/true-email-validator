import { validateEmail } from '../validate-email'

const testCases = [
  ['john.smith@google.com', undefined, 
    { 
      valid: true, 
      username: 'john.smith', 
      domain: 'google.com',
      domainLiteral: undefined,
      issues: []
    }],
  ['(comment A)"foo@bar"(comment B)@(comment C)baz.com(comment D)', { allowComments: true }, 
    { 
      valid: true, 
      commentLocalPartPrefix: 'comment A', 
      username: '"foo@bar"', 
      commentLocalPartSuffix: 'comment B',
      commentDomainPrefix: 'comment C',
      domain: 'baz.com',
      domainLiteral: undefined,
      commentDomainSuffix: 'comment D',
      issues: []
    }],
  ['(comment A)"foo@bar"(comment B)@(comment C)baz.com(comment D)', { allowComments: true }, 
    { 
      valid: true, 
      commentLocalPartPrefix: 'comment A', 
      username: '"foo@bar"', 
      commentLocalPartSuffix: 'comment B',
      commentDomainPrefix: 'comment C',
      domain: 'baz.com',
      domainLiteral: undefined,
      commentDomainSuffix: 'comment D',
      issues: []
    }],
  ['(comment A)"foo@bar"(comment B)@(comment C)[123.123.123.124](comment D)',
    { allowComments: true, allowIPV4:true }, 
    { 
      valid: true, 
      commentLocalPartPrefix: 'comment A', 
      username: '"foo@bar"', 
      commentLocalPartSuffix: 'comment B',
      commentDomainPrefix: 'comment C',
      domain: undefined,
      domainLiteral: '123.123.123.124',
      commentDomainSuffix: 'comment D',
      issues: []
    }],
  ['foo@[::8]', { allowIPV6 : true },
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: undefined,
      domainLiteral: '::8',
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['foo@localhost', { allowLocalhost: true },
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'localhost',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['foo@bar.notatld', { arbitraryTLDs : true },
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'bar.notatld',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['foo@bar.notatld', { allowedTLDs : { notatld: true } },
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'bar.notatld',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['foo@bar.notatld', { allowedTLDs : [ 'notatld' ] },
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'bar.notatld',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: []
    }],
  [undefined, undefined, { valid: false, issues: ['is null or undefined']}],
  [null, undefined, { valid: false, issues: ['is null or undefined']}],
  [123, undefined, { valid: false, issues: ['is not type string']}],
  ['foo', undefined, { valid: false, issues: ['not recognized as a valid email address']}],
  ['foo..bar@baz.com', undefined, { valid: false, issues: ['not recognized as a valid email address']}],
  ['.foo@baz.com', undefined, { valid: false, issues: ['not recognized as a valid email address']}],
  ['foo.@baz.com', undefined, { valid: false, issues: ['not recognized as a valid email address']}],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk@foo.com', undefined, // 64 char local part
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'foo.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlkl@foo.com', undefined, // 65 char local part
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlkl', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'foo.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['the username/local part exceeds the maximum 64 bytes in length (65 bytes)']
    }],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlkl@foo.com', { noLengthCheck : true }, // 65 char local part
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlkl', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'foo.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabc.com', undefined, // 254 bytes total
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabc.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcd.com', undefined, // 255 bytes total
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcd.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['the email address exceeds the maximum of 254 bytes in length (255 bytes)']
    }],
  ['(comment)foo@bar.com', undefined,
    { 
      valid: false, 
      commentLocalPartPrefix: 'comment', 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'bar.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['contains disallowed comment(s)']
    }],
  ['foo(comment)@bar.com', undefined, 
    { 
      valid: false, 
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: 'comment',
      commentDomainPrefix: undefined,
      domain: 'bar.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['contains disallowed comment(s)']
    }],
  ['foo@(comment)bar.com', undefined, 
    { 
      valid: false, 
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: 'comment',
      domain: 'bar.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['contains disallowed comment(s)']
    }],
  ['foo@bar.com(comment)', undefined, 
    { 
      valid: false, 
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'bar.com',
      domainLiteral: undefined,
      commentDomainSuffix: 'comment',
      issues: ['contains disallowed comment(s)']
    }],
  ['foo@[1.1.1.1](comment)', undefined, 
    { 
      valid: false, 
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: undefined,
      domainLiteral: '1.1.1.1',
      commentDomainSuffix: 'comment',
      issues: ['contains disallowed comment(s)', 'contains disallowed domain literal']
    }],
  ['foo@1.1.1.1', undefined, 
    { 
      valid: false, 
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: '1.1.1.1',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['domain appears to be an invalid IPV4 address; must be a domain name or use domain literal']
    }],
  ['foo@[123.123.123.123]', { allowAnyDomainLiteral: true },
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: undefined,
      domainLiteral: '123.123.123.123',
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['foo@[::8]', { allowAnyDomainLiteral: true },
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: undefined,
      domainLiteral: '::8',
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['foo@localhost', undefined,
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'localhost',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['domain is disallowed localhost name']
    }],
  ['foo@bar.notatld', undefined,
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'bar.notatld',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ["contains unknown TLD 'notatld'"]
    }],
  ['foo@notatld', undefined,
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'notatld',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ["contains unknown TLD 'notatld'"]
    }],
  ['foo#%@foo.com', { excludeChars : ['#', '%'] },
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'foo#%', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'foo.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ["contains excluded character '#'", "contains excluded character '%'"]
    }],
  ['foo#%@foo.com', { excludeChars : '#%' },
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'foo#%', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'foo.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ["contains excluded character '#'", "contains excluded character '%'"]
    }],
  ['foo@foo.com', { excludeChars : null },
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'foo.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['foo#%@foo.com', { excludeDomains : ['foo.com', '.com'] },
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'foo#%', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'foo.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['domain is excluded']
    }],
  ['foo@foo.com', { excludeDomains : null },
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'foo.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['foo#@google.com', undefined,
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'foo#', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'google.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ["Google email addresses may only contain letters (a-z), numbers (0-9), dashes (-), underscores (_), apostrophes ('), periods (.), and the plus sign (+) for plus addressing."]
    }],
  ['foo#@hotmail.com', undefined,
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'foo#', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'hotmail.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['Hotmail email addresses may only contain letters (a-z), numbers (0-9), dashes (-), underscores (_), periods (.), and the plus sign (+) for plus addressing.']
    }],
  ['"foo@bar"@google.com', undefined,
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: '"foo@bar"', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'google.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['Google does not support quoted email addresses']
    }],
  ['"foo@bar"@hotmail.com', undefined,
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: '"foo@bar"', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'hotmail.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['Hotmail does not support quoted email addresses']
    }],
  ['foo#@google.com', { noDomainSpecificValidation: true },
    { 
      valid: true,
      commentLocalPartPrefix: undefined, 
      username: 'foo#', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'google.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: []
    }],
  ['foo@com', { noTLDOnly: true },
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'foo', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['TLD only domains are not allowed']
    }],
  ['foo中@bar.com', { noNonASCIILocalPart: true },
    { 
      valid: false,
      commentLocalPartPrefix: undefined, 
      username: 'foo中', 
      commentLocalPartSuffix: undefined,
      commentDomainPrefix: undefined,
      domain: 'bar.com',
      domainLiteral: undefined,
      commentDomainSuffix: undefined,
      issues: ['non-ASCII characters are not allowed in the username (local part) of the address']
    }]
]

describe('validateEmail', () => {
  test.each(testCases)('%s, options %p results in %p', (email, options, expected) =>
    expect(validateEmail(email, options)).toEqual(expected))

  test.each(testCases)('%s, context %p results in %p', (email, context = {}, expected) => {
    context.validation = validateEmail
    expect(context.validation(email)).toEqual(expected)
  })
})