UPDATE_TLDS_SRC_DIR:=$(SRC)/tools/update-tlds
UPDATE_TLDS_MJS:=tools/update-tlds.mjs
UPDATE_TLDS_ENTRY:=$(UPDATE_TLDS_SRC_DIR)/index.mjs
UPDATE_TLDS_SRC:=$(shell find $(UPDATE_TLDS_SRC_DIR) -name "*.mjs")
BUILD_TARGETS+=$(UPDATE_TLDS_MJS)

$(UPDATE_TLDS_MJS): package.json $(UPDATE_TLDS_SRC) $(SRC)/lib/get-latest-tlds.mjs
	mkdir -p tools
	cd $(UPDATE_TLDS_SRC_DIR) && npm i
	JS_PACKAGE_PATH=$(UPDATE_TLDS_SRC_DIR) \
	JS_BUILD_TARGET=$(UPDATE_TLDS_ENTRY) \
		$(SDLC_ROLLUP) --config $(SDLC_ROLLUP_CONFIG)
