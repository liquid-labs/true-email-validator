EMAIL_RES_MJS:=$(SRC)/lib/lib/email-res.mjs
BUILD_TARGETS:=$(EMAIL_RES_MJS)

$(EMAIL_RES_MJS): $(RE_TMPL_GENERATOR_MJS)
	node --enable-source-maps $(RE_TMPL_GENERATOR_MJS)