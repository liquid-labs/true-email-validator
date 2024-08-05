import type * as _Shared from './shared.js';
export type _Literal = { type: "literal", value: string, start: number, end: number, count: number, ref: _Shared.ReferenceRange };
export type Term_Addr_spec = {
	type: 'addr_spec',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		Term_Local_part,
		_Literal & {value: "\x40"},
		Term_Domain
	]
}
export declare function Parse_Addr_spec (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Addr_spec,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Local_part = {
	type: 'local_part',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(Term_Dot_atom | Term_Quoted_string)
	]
}
export declare function Parse_Local_part (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Local_part,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Domain = {
	type: 'domain',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(Term_Dot_atom | Term_Domain_literal)
	]
}
export declare function Parse_Domain (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Domain,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Dot_atom = {
	type: 'dot_atom',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		{ type: '(...)?', value: [] | [Term_CFWS], start: number, end: number, count: number, ref: _Shared.ReferenceRange },
		_Literal,
		{ type: '(...)?', value: [] | [Term_CFWS], start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_Dot_atom (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Dot_atom,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Dot_atom_text = {
	type: 'dot_atom_text',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		{ type: '(...)+', value: [Term_Atext] & Array<Term_Atext>, start: number, end: number, count: number, ref: _Shared.ReferenceRange },
		{ type: '(...)*', value: Array<{
	type: '(...)',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal & {value: "\x2e"},
		{ type: '(...)+', value: [Term_Atext] & Array<Term_Atext>, start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}>, start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_Dot_atom_text (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Dot_atom_text,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Atext = {
	type: 'atext',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(Term_ALPHA | Term_DIGIT | Term_UTF8_NON_ASCII | _Literal & {value: "\x21"} | _Literal & {value: "\x23"} | _Literal & {value: "\x24"} | _Literal & {value: "\x25"} | _Literal & {value: "\x26"} | _Literal & {value: "\x27"} | _Literal & {value: "\x2a"} | _Literal & {value: "\x2b"} | _Literal & {value: "\x2d"} | _Literal & {value: "\x2f"} | _Literal & {value: "\x3d"} | _Literal & {value: "\x3f"} | _Literal & {value: "\x5e"} | _Literal & {value: "\x5f"} | _Literal & {value: "\x60"} | _Literal & {value: "\x7b"} | _Literal & {value: "\x7c"} | _Literal & {value: "\x7d"} | _Literal & {value: "\x7e"})
	]
}
export declare function Parse_Atext (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Atext,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Domain_literal = {
	type: 'domain_literal',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		{ type: '(...)?', value: [] | [Term_CFWS], start: number, end: number, count: number, ref: _Shared.ReferenceRange },
		_Literal & {value: "\x5b"},
		_Literal,
		_Literal & {value: "\x5d"},
		{ type: '(...)?', value: [] | [Term_CFWS], start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_Domain_literal (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Domain_literal,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Dtext = {
	type: 'dtext',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal | _Literal)
	]
}
export declare function Parse_Dtext (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Dtext,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Quoted_string = {
	type: 'quoted_string',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		{ type: '(...)?', value: [] | [Term_CFWS], start: number, end: number, count: number, ref: _Shared.ReferenceRange },
		_Literal,
		{ type: '(...)?', value: [] | [Term_CFWS], start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_Quoted_string (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Quoted_string,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Qcontent = {
	type: 'qcontent',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(Term_Qtext | Term_Quoted_pair)
	]
}
export declare function Parse_Qcontent (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Qcontent,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Qtext = {
	type: 'qtext',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal | _Literal | _Literal | Term_UTF8_NON_ASCII)
	]
}
export declare function Parse_Qtext (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Qtext,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Quoted_pair = {
	type: 'quoted_pair',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal & {value: "\x5c"},
		(Term_VCHAR | Term_WSP)
	]
}
export declare function Parse_Quoted_pair (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Quoted_pair,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Comment = {
	type: 'comment',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal & {value: "\x28"},
		_Literal,
		_Literal & {value: "\x29"}
	]
}
export declare function Parse_Comment (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Comment,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Ccontent = {
	type: 'ccontent',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(Term_Ctext | Term_Quoted_pair | Term_Comment)
	]
}
export declare function Parse_Ccontent (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Ccontent,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_Ctext = {
	type: 'ctext',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal | _Literal | _Literal)
	]
}
export declare function Parse_Ctext (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_Ctext,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_CFWS = {
	type: 'CFWS',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		({
	type: '(...)',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		{ type: '(...)*', value: Array<{
	type: '(...)',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		{ type: '(...)?', value: [] | [Term_FWS], start: number, end: number, count: number, ref: _Shared.ReferenceRange },
		Term_Comment
	]
}>, start: number, end: number, count: number, ref: _Shared.ReferenceRange },
		{ type: '(...)?', value: [] | [Term_FWS], start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
} | Term_FWS)
	]
}
export declare function Parse_CFWS (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_CFWS,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_FWS = {
	type: 'FWS',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		{ type: '(...)?', value: [] | [{
	type: '(...)',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		{ type: '(...)*', value: Array<Term_WSP>, start: number, end: number, count: number, ref: _Shared.ReferenceRange },
		Term_CRLF
	]
}], start: number, end: number, count: number, ref: _Shared.ReferenceRange },
		{ type: '(...)+', value: [Term_WSP] & Array<Term_WSP>, start: number, end: number, count: number, ref: _Shared.ReferenceRange }
	]
}
export declare function Parse_FWS (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_FWS,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_CRLF = {
	type: 'CRLF',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal & {value: "\x0d"},
		_Literal & {value: "\x0a"}
	]
}
export declare function Parse_CRLF (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_CRLF,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_ALPHA = {
	type: 'ALPHA',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal | _Literal)
	]
}
export declare function Parse_ALPHA (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_ALPHA,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_DIGIT = {
	type: 'DIGIT',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal
	]
}
export declare function Parse_DIGIT (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_DIGIT,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_UTF8_NON_ASCII = {
	type: 'UTF8_NON_ASCII',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal
	]
}
export declare function Parse_UTF8_NON_ASCII (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_UTF8_NON_ASCII,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_DQUOTE = {
	type: 'DQUOTE',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal & {value: "\x22"}
	]
}
export declare function Parse_DQUOTE (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_DQUOTE,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_VCHAR = {
	type: 'VCHAR',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		_Literal
	]
}
export declare function Parse_VCHAR (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_VCHAR,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}

export type Term_WSP = {
	type: 'WSP',
	start: number,
	end: number,
	count: number,
	ref: _Shared.ReferenceRange,
	value: [
		(_Literal & {value: "\x20"} | _Literal & {value: "\x09"})
	]
}
export declare function Parse_WSP (i: string, refMapping?: boolean): _Shared.ParseError | {
	root: _Shared.SyntaxNode & Term_WSP,
	reachBytes: number,
	reach: null | _Shared.Reference,
	isPartial: boolean
}
