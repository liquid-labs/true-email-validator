VALID_TLDS_MJS:=$(SRC)/lib/valid-tlds.mjs
BUILD_TARGETS+=$(VALID_TLDS_MJS)
PHONY_TARGETS+=$(VALID_TLDS_MJS)

$(VALID_TLDS_MJS): $(UPDATE_TLDS_MJS)
	node --enable-source-maps tools/update-tlds.mjs