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
    { allowComments: true, allowDomainLiteral: true }, 
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
  [undefined, undefined, { valid: false, issues: ['is null or undefined']}],
  [null, undefined, { valid: false, issues: ['is null or undefined']}],
  [123, undefined, { valid: false, issues: ['is not type string']}],
  ['foo', undefined, { valid: false, issues: ['not recognized as a valid email address']}],
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
      issues: ['domain appears to be a disallowed IP address']
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