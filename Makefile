EXT_DIR="$(HOME)/.local/share/gnome-shell/extensions"
UUID=`perl -nle 'if (m{"uuid": "([^"]+)"}) { print $$1 }' metadata.json`
FILES="AUTHORS COPYING README extension.js metadata.json screenshot.png"

SCHEMA="org.gnome.shell"
KEY="enabled-extensions"
STATUS=$$(gsettings get $(SCHEMA) $(KEY) | grep "$(UUID)" > /dev/null 2>&1; if [ $$? = "0" ]; then echo "enabled"; else echo "disabled"; fi)

all:

install:
	@echo "You should install this extension from <https://extensions.gnome.org/extension/967>."
	@echo "If you really need to install from source, for instance because you are making changes, you can use 'make force-install'."

force-install: uninstall-link
	@if [ `id -u` = 0 ]; then \
	    echo "You need to install this extension as a normal user."; \
	    exit 1; \
	fi
	@mkdir -p $(EXT_DIR)/$(UUID)
	@for f in "$(FILES)"; do \
	    cp -f $$f $(EXT_DIR)/$(UUID)/$$f; \
	done
	@if [ $(STATUS) = "enabled" ]; then \
	    echo "To reload the shell (and the extension) press ALT-F2 and type 'r'."; \
	else \
	    echo "To enable the extension type 'make enable'."; \
	fi

install-link: uninstall-link
	@if [ -e $(EXT_DIR)/$(UUID) ]; then \
	    echo "An installed version of the extension exists; remove it first."; \
	    exit 1; \
	fi
	@ln -s $$PWD $(EXT_DIR)/$(UUID)
	@if [ $(STATUS) = "enabled" ]; then \
	    echo "To reload the shell (and the extension) press ALT-F2 and type 'r'."; \
	else \
	    echo "To enable the extension type 'make enable'."; \
	fi

uninstall-link:
	@if [ -L $(EXT_DIR)/$(UUID) ]; then \
	    rm $(EXT_DIR)/$(UUID); \
	fi

uninstall: disable-internal uninstall-link
	@for f in "$(FILES)" ChangeLog; do \
	    rm $(EXT_DIR)/$(UUID)/$$f 2> /dev/null || true; \
	done
	@[ -d $(EXT_DIR)/$(UUID) ] && rmdir $(EXT_DIR)/$(UUID); true

enable: disable-internal
	@if [ ! -d "$(EXT_DIR)/$(UUID)" ]; then \
	    echo "Before enabling the extension you have to install it, see 'make install'"; \
	    exit 1; \
	fi
	@curr_val=`gsettings get $(SCHEMA) $(KEY)`; \
	full_id="'$(UUID)'"; \
	other_extensions=`echo "$$curr_val" | sed -e "s/]$$//"`; \
	new_val="$$other_extensions, $$full_id]"; \
	new_val=`echo "$$new_val" | sed -e 's/\[, /[/'` ; \
	gsettings set $(SCHEMA) $(KEY) "$$new_val"
	@echo "To reload the shell (and the extension) press ALT-F2 and type 'r'."; \

disable: disable-internal
	@if [ $(STATUS) = "enabled" ]; then \
	    echo "I cannot disable the extension!"; \
	    exit 1; \
	fi

disable-internal:
	@curr_val=`gsettings get $(SCHEMA) $(KEY)`; \
	full_id="'$(UUID)'"; \
	new_val=`echo "$$curr_val" | sed -e "s/$$full_id//"`; \
	new_val=`echo "$$new_val" | sed -e 's/, ]/]/'` ; \
	new_val=`echo "$$new_val" | sed -e 's/\[, /[/'` ; \
	new_val=`echo "$$new_val" | sed -e 's/, ,/,/'` ; \
	gsettings set $(SCHEMA) $(KEY) "$$new_val"

status:
	@if [ $(STATUS) = "enabled" ]; then \
	    echo "The extension is enabled"; \
	else \
	    echo "The extension is disabled"; \
	fi

dist:
	@git log > ChangeLog; \
	for f in "$(FILES)"; do \
	    if [ "x$$f" != "xREADME" ]; then \
	        dist_file="$$dist_file $$f"; \
	    fi; \
	done; \
	rm -f hide-legacy-tray.zip 2> /dev/null; \
	zip hide-legacy-tray.zip $$dist_file ChangeLog; \
	rm ChangeLog
