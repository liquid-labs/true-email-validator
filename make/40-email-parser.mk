EMAIL_PARSER:=$(SRC)/lib/bnf/email.js
EMAIL_PARSER_SRC:=$(SRC)/lib/bnf/email.bnf $(BNF_PARSER)
BUILD_TARGETS+=$(EMAIL_PARSER)

$(EMAIL_PARSER): $(EMAIL_PARSER_SRC)
	node $(BNF_PARSER) src/lib/bnf/email.bnf src/lib/bnf/