import structuredClone from 'core-js/actual/structured-clone'

import { validateEmail } from '../validate-email'

const testCases = [
  ['john.smith@google.com', undefined,
    {
      isValid       : true,
      address       : 'john.smith@google.com',
      username      : 'john.smith',
      domain        : 'google.com',
      domainLiteral : undefined,
      issues        : []
    }],
  ['"foo@bar"@baz.com', undefined,
    {
      isValid                : false,
      address                : '"foo@bar"@baz.com',
      commentLocalPartPrefix : undefined,
      username               : '"foo@bar"',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'baz.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['uses disallowed quoted username/local part']
    }],
  ['(comment A)"foo@bar"(comment B)@(comment C)baz.com(comment D)',
    { allowComments : true, allowQuotedLocalPart : true },
    {
      isValid                : true,
      address                : '"foo@bar"@baz.com',
      commentLocalPartPrefix : 'comment A',
      username               : '"foo@bar"',
      commentLocalPartSuffix : 'comment B',
      commentDomainPrefix    : 'comment C',
      domain                 : 'baz.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : 'comment D',
      issues                 : []
    }],
  ['(comment A)"foo@bar"(comment B)@(comment C)[123.123.123.124](comment D)',
    { allowComments : true, allowIPV4 : true, allowQuotedLocalPart : true },
    {
      isValid                : true,
      address                : '"foo@bar"@[123.123.123.124]',
      commentLocalPartPrefix : 'comment A',
      username               : '"foo@bar"',
      commentLocalPartSuffix : 'comment B',
      commentDomainPrefix    : 'comment C',
      domain                 : undefined,
      domainLiteral          : '123.123.123.124',
      commentDomainSuffix    : 'comment D',
      issues                 : []
    }],
  ['foo@[::8]', { allowIPV6 : true },
    {
      isValid                : true,
      address                : 'foo@[::8]',
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : '::8',
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@[::8]', { allowIPV4 : true, allowIPV6 : true },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : '::8',
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@[123.123.123.123]', { allowIPV4 : true, allowIPV6 : true },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : '123.123.123.123',
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@[blah]', { allowIPV4 : true },
    {
      isValid                : false,
      address                : 'foo@[blah]',
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : 'blah',
      commentDomainSuffix    : undefined,
      issues                 : ['domain literal is not a valid IPV4 address']
    }],
  ['foo@[blah]', { allowIPV6 : true },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : 'blah',
      commentDomainSuffix    : undefined,
      issues                 : ['domain literal is not a valid IPV6 address']
    }],
  ['foo@[blah]', { allowIPV4 : true, allowIPV6 : true },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : 'blah',
      commentDomainSuffix    : undefined,
      issues                 : ['domain literal is not a valid IP address']
    }],
  ['foo@[255.240.0.0]', { allowIPV4 : true },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : '255.240.0.0',
      commentDomainSuffix    : undefined,
      issues                 : ['domain literal is in the format of an IPV4 address, but specifies a non-host address (such as a broadcast address)']
    }],
  ['foo@[127.0.0.1]', { allowIPV4 : true },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : '127.0.0.1',
      commentDomainSuffix    : undefined,
      issues                 : ['domain literal is disallowed localhost address']
    }],
  ['foo@[::1]', { allowIPV6 : true },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : '::1',
      commentDomainSuffix    : undefined,
      issues                 : ['domain literal is disallowed localhost address']
    }],
  ['foo@[::1]', { allowAnyDomainLiteral : true },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : '::1',
      commentDomainSuffix    : undefined,
      issues                 : ['domain literal is disallowed localhost address or name']
    }],
  ['foo@127.0.0.1', undefined,
    {
      isValid                : false,
      address                : 'foo@127.0.0.1',
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : '127.0.0.1',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['domain appears to be an IPV4 address; must be a domain name or use domain literal', 'domain is disallowed localhost address']
    }],
  ['foo@127.0.0.1', { allowAnyDomain : true },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : '127.0.0.1',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['domain is disallowed localhost name']
    }],
  ['foo@127.0.0.1', { allowAnyDomain : true, allowLocalhost : true },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : '127.0.0.1',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@13.123.0.1', { allowAnyDomain : true },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : '13.123.0.1',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@::1', undefined, { isValid : false, issues : ['not recognized as a valid email address'] }],
  ['foo@localhost', { allowLocalhost : true },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'localhost',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@bar.notatld', { arbitraryTLDs : true },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.notatld',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@bar.123', { arbitraryTLDs : true }, // arbitrary's OK, but '123' is not a valid TLD name
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.123',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['top-level domain does not adhere to TLD naming restrictions']
    }],
  ['foo@1.com', { allowAnyDomain : true, arbitraryTLDs : true }, // '1' is not a valid domain label
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : '1.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ["domain label '1' is not valid"]
    }],
  ['foo@bar.notatld', { allowedTLDs : { notatld : true } },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.notatld',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@bar.notatld', { allowedTLDs : ['notatld'] },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.notatld',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  [undefined, undefined, { isValid : false, issues : ['is null or undefined'] }],
  [null, undefined, { isValid : false, issues : ['is null or undefined'] }],
  [123, undefined, { isValid : false, issues : ['is not type string'] }],
  ['foo', undefined, { isValid : false, issues : ['not recognized as a valid email address'] }],
  ['foo..bar@baz.com', undefined, { isValid : false, issues : ['not recognized as a valid email address'] }],
  ['.foo@baz.com', undefined, { isValid : false, issues : ['not recognized as a valid email address'] }],
  ['foo.@baz.com', undefined, { isValid : false, issues : ['not recognized as a valid email address'] }],
  ['f@oo@baz.com', undefined,
    {
      isValid : false,
      issues  : ["parsed as a 'partial' address; perhaps you need double quotes (\") around the username (local part)"]
    }],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk@foo.com', undefined, // 64 char local part
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlkl@foo.com', undefined, // 65 char local part
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlkl',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['the username/local part exceeds the maximum 64 bytes in length (65 bytes)']
    }],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlkl@foo.com', { noLengthCheck : true }, // 65 char local part
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlkl',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.com', undefined, // 254 bytes total
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz.abcdefghijklmnopqrstuvwxyz.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcd.com', undefined, // 255 bytes total
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijlk',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcd.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['the email address exceeds the maximum of 254 bytes in length (255 bytes)', "domain label 'abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcd' is not valid"]
    }],
  ['(comment)foo@bar.com', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : 'comment',
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['contains disallowed comment(s)']
    }],
  ['foo(comment)@bar.com', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : 'comment',
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['contains disallowed comment(s)']
    }],
  ['foo@(comment)bar.com', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : 'comment',
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['contains disallowed comment(s)']
    }],
  ['foo@bar.com(comment)', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : 'comment',
      issues                 : ['contains disallowed comment(s)']
    }],
  ['foo@[1.1.1.1](comment)', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : '1.1.1.1',
      commentDomainSuffix    : 'comment',
      issues                 : ['contains disallowed comment(s)', 'contains disallowed domain literal']
    }],
  ['foo@1.1.1.1', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : '1.1.1.1',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['domain appears to be an IPV4 address; must be a domain name or use domain literal']
    }],
  ['foo@[123.123.123.123]', { allowAnyDomainLiteral : true },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : '123.123.123.123',
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@[::8]', { allowAnyDomainLiteral : true },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : undefined,
      domainLiteral          : '::8',
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@localhost', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'localhost',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['domain is disallowed localhost name']
    }],
  ['foo@bar.notatld', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.notatld',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ["contains unknown TLD 'notatld'"]
    }],
  ['foo@notatld', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'notatld',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ["contains unknown TLD 'notatld'"]
    }],
  ['foo#%@foo.com', { excludeChars : ['#', '%'] },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo#%',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : [
        "contains excluded character '#' in username",
        "contains excluded character '%' in username"
      ]
    }],
  ['foo#%@foo.com', { excludeChars : ['#%'] },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo#%',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ["contains excluded character sequence '#%' in username"]
    }],
  ['foo#%@foo.com', { excludeChars : '#%' },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo#%',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : [
        "contains excluded character '#' in username",
        "contains excluded character '%' in username"
      ]
    }],
  ['foo@foo.com', { excludeChars : null },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo+bar@foo.com', { noPlusEmails : true },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo+bar',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ["contains excluded character '+' in username"]
    }],
  ['foo#%@foo.com', { excludeDomains : ['foo.com', '.com'] },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo#%',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ["domain '*.foo.com' is excluded"]
    }],
  ['foo#%@foo.com', { excludeDomains : ['com'] },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo#%',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ["domain '*.com' is excluded"]
    }],
  ['foo#%@foo.com', { excludeDomains : ['foo.com'] },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo#%',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ["domain '*.foo.com' is excluded"]
    }],
  ['foo#%@barfoo.com', { excludeDomains : ['foo.com'] },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo#%',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'barfoo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@foo.com', { excludeDomains : null },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'foo.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo#@google.com', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo#',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'google.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ["Google email addresses may only contain letters (a-z), numbers (0-9), dashes (-), underscores (_), apostrophes ('), periods (.), and the plus sign (+) for plus addressing."]
    }],
  ['foo#@notgoogle.com', undefined,
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo#',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'notgoogle.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo#@hotmail.com', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo#',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'hotmail.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['Hotmail email addresses may only contain letters (a-z), numbers (0-9), dashes (-), underscores (_), periods (.), and the plus sign (+) for plus addressing.']
    }],
  ['"foo@bar"@google.com', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : '"foo@bar"',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'google.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['uses disallowed quoted username/local part', 'Google does not support quoted email addresses']
    }],
  ['"foo@bar"@hotmail.com', undefined,
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : '"foo@bar"',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'hotmail.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['uses disallowed quoted username/local part', 'Hotmail does not support quoted email addresses']
    }],
  ['foo#@google.com', { noDomainSpecificValidation : true },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo#',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'google.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo@com', { noTLDOnly : true },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['TLD only domains are not allowed']
    }],
  ['foo中@bar.com', { noNonASCIILocalPart : true },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo中',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['non-ASCII characters are not allowed in the username (local part) of the address']
    }],
  ['foo中@bar.com', undefined,
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo中',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo𗀀@bar.com', undefined, // high-byet unicode 17000
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo𗀀',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo1@bar.com',
    { validateInput : () => 'none shall pass' },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo1',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['none shall pass']
    }],
  ['foo2@bar.com',
    { validateInput : () => true },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo2',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo3@bar.com',
    { validateInput : () => [] },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo3',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['failed custom input validation']
    }],
  ['foo4@bar.com',
    { validateInput : (input) => input === 'foo4@bar.com' },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo4',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['foo1@bar.com',
    { validateResult : (result) => Object.assign({}, result, { isValid : false, issues : ['none shall pass'] }) },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo1',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['none shall pass']
    }],
  ['foo2@bar.com',
    { validateResult : (result) => { result.isValid = false; result.issues.push('none shall pass') } },
    {
      isValid                : false,
      commentLocalPartPrefix : undefined,
      username               : 'foo2',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : ['none shall pass']
    }],
  ['foo3@bar.com',
    {
      validateResult : (result) => {
        if (result.address !== 'foo3@bar.com') {
          result.isValid = false
          result.issues.push('unexpected result.address')
        }
      }
    },
    {
      isValid                : true,
      commentLocalPartPrefix : undefined,
      username               : 'foo3',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'bar.com',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }],
  ['Foo@BAR.COM', undefined, // high-byet unicode 17000
    {
      isValid                : true,
      address                : 'Foo@bar.com',
      commentLocalPartPrefix : undefined,
      username               : 'Foo',
      commentLocalPartSuffix : undefined,
      commentDomainPrefix    : undefined,
      domain                 : 'BAR.COM',
      domainLiteral          : undefined,
      commentDomainSuffix    : undefined,
      issues                 : []
    }]
]

// to avoid having to specify 'address' for every test, we massage the test cases into two versions, which feed
// different tests, one without addresses, and one of only cases with address
const noAddressTestCases = testCases.map((testCase) => {
  const { validateInput, validateResult } = testCase[1] || {}
  // yes, this modifies the base, but it's OK because the clone gets corrected and there is no crossover with the
  // address test cases
  delete testCase[1]?.validateInput
  delete testCase[1]?.validateResult
  const clone = structuredClone(testCase)
  if (clone[1] !== undefined) {
    clone[1].validateInput = validateInput
    clone[1].validateResult = validateResult
  }
  delete clone[2].address
  return clone
})

const addressTestCases = testCases
  .filter((testCase) => !!testCase[2].address)
  .map((testCase) => {
    const clone = structuredClone(testCase)
    clone[2] = clone[2].address
    return clone
  })

describe('validateEmail', () => {
  test.each(noAddressTestCases)('%s, options %p results in %p', (email, options, expected) => {
  // test.each(testCases)('%s, options %p results in %p', (email, options, expected) => {
    const result = validateEmail(email, options)
    delete result.address // because we don't want to specify for each test
    // the address is tested below
    expect(result).toEqual(expected)
  })

  // essentially same as above test, just checks the context settings are correct when called with 'this'
  test.each(noAddressTestCases)('%s, context %p results in %p', (email, context = {}, expected) => {
    context.validation = validateEmail
    const result = context.validation(email)
    delete result.address
    expect(result).toEqual(expected)
  })

  // test the address is correctly reported
  test.each(addressTestCases)('%s, options %p => address %s', (email, options, expectedAddress) =>
    expect(validateEmail(email, options).address).toBe(expectedAddress))
})
