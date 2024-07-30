BNF_PARSER_PATH:=$(SRC)/tools/bnf-parser
BNF_PARSER:=tools/bnf-parser/bin/cli.mjs
BNF_PARSER_SRC:=$(shell find $(BNF_PARSER_PATH) -name "*.js" -name "*.ts" -name "*.bnf")
BUILD_TARGETS+=$(BNF_PARSER)

$(BNF_PARSER): $(BNF_PARSER_SRC)
	cd $(BNF_PARSER_PATH) && npm i
	cd $(BNF_PARSER_PATH) && npm run build
	{ ! [ -L tools/bnf-parser ] && cd tools && ln -s ../$(BNF_PARSER_PATH) bnf-parser; } || true
	mv tools/bnf-parser/bin/cli.js tools/bnf-parser/bin/cli.mjs