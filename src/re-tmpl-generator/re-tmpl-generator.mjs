import { mkdir, writeFile } from 'node:fs/promises'
import { resolve as resolvePath } from 'node:path'

import { regex } from 'regex'
import { fqDomainNameREString, ipREString, tldNameREString } from 'regex-repo'

const emailRE = (group) => regex`
\g<${group}>

(?(DEFINE)
   (?<address>         \g<name_addr> | \g<addr_spec>)
   (?<display_req>     \g<display_name> \g<angle_addr>)
   (?<name_addr>       \g<display_name>? \g<angle_addr>)
   (?<angle_addr>      \g<CFWS>? < \g<addr_spec> > \g<CFWS>?)
   (?<display_name>    \g<phrase>)

   (?<addr_spec>       \g<local_part> @ \g<domain>)
   (?<local_part>      \g<dot_atom> | \g<quoted_string>)
   (?<domain>          \g<dot_atom> | \g<domain_literal>)
   (?<domain_literal>  \g<CFWS>? \[ (?: \g<FWS>? \g<dcontent>)* \g<FWS>?
                                 \] \g<CFWS>?)
   (?<dcontent>        \g<dtext> | \g<quoted_pair>)
   #                       ASCII punctuation v       v        v  
   (?<dtext>           \g<NO_WS_CTL> | [\x21-\x40\x5e-\x60\x7b-\x7e\p{L}])

   (?<atext>           \g<ALPHA> | \g<DIGIT> | [!#$%&'*+\/=?^_\`\{\|\}~\-])
   (?<atom>            \g<CFWS>? \g<atext>+ \g<CFWS>?)
   (?<dot_atom>        \g<CFWS>? \g<dot_atom_text> \g<CFWS>?)
   (?<dot_atom_text>   \g<atext>+ (?: \. \g<atext>+)*)

   (?<text>            [\x01-\x09\x0b\x0c\x0e-\x40\x5b-\x60\x7e\x7f\p{L}])
   (?<quoted_pair>     \\ \g<text>)

   (?<qtext>           \g<NO_WS_CTL> | [\x21\x23-\x40\x5b\x5d-\x60\x7b-\x7e\p{L}])
   (?<qcontent>        \g<qtext> | \g<quoted_pair>)
   (?<quoted_string>   \g<CFWS>? \g<DQUOTE> (?:\g<FWS>? \g<qcontent>)*
                        \g<FWS>? \g<DQUOTE> \g<CFWS>?)

   (?<word>            \g<atom> | \g<quoted_string>)
   (?<phrase>          \g<word>+)

   # Folding white space
   (?<FWS>             (?: \g<WSP>* \g<CRLF>)? \g<WSP>+)
   (?<ctext>           \g<NO_WS_CTL> | [\x21-\x27\x2a-\x40\x5b\x5d-\x60\x7b-\x7e\p{L}])
   (?<ccontent>        \g<ctext> | \g<quoted_pair> | \g<comment>)
   # In the full BNF form, you can have comments in comments; JS REs can't recurse, though.
   # (?<comment>         \( (?: \g<FWS>? \g<ccontent>)* \g<FWS>? \) )
   (?<comment>         \( (?: \g<FWS>? (?: \g<ctext> | \g<quoted_pair> ))* \g<FWS>? \) )
   (?<CFWS>            (?: \g<FWS>? \g<comment>)*
                       (?: (?:\g<FWS>? \g<comment>) | \g<FWS>))

   # No whitespace control
   (?<NO_WS_CTL>       [\x01-\x08\x0b\x0c\x0e-\x1f\x7f])

   (?<ALPHA>           \p{L})
   (?<DIGIT>           [0-9])
   (?<CRLF>            \x0d \x0a)
   (?<DQUOTE>          ")
   (?<WSP>             [\x20\x09])
 )
 `

const reTmplGenerator = async () => {  
  const libLibDir = resolvePath('src', 'lib', 'lib')
  const libLibPath = resolvePath(libLibDir, 'email-res.mjs')
  const content = `/* This file is generated as part of the build process. To make changes to the regular expressions, see the 'src/re-tmpl-generator' tool code. */

export const emailNoDisplayRE = ${emailRE('addr_spec').toString()}g

export const emailOrDisplayRE = ${emailRE('address').toString()}g

export const emailAndDisplayRE = ${emailRE('display_req').toString()}g

export const emailDomainRE = /@(${emailRE('domain').toString().slice(1, -2)})/

export const emailLocalPartRE /(${emailRE('local_part').toString().slice(1, -2)})@/

export emailCommentRE = ${emailRE('comment').toString()}g

export emailDisplayNameRE = ${emailRE('display_name').toString()}g

export emailDomainLiteralRE = ${emailRE('domain_literal').toString()}g

/* maybe
export const emailLocalPartRE = /${emailRE('local_part').toString().slice(1, -2)}@/vg

export const emailDomainRE = /@${emailRE('domain').toString().slice(1, -2)}/vg
*/
`
  await mkdir(libLibDir, { recursive : true })
  await writeFile(libLibPath, content, { encoding: 'utf8' })
}

export { reTmplGenerator }