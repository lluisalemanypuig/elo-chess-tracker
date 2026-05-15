all: css/*.css

%.css: %.scss css/main.scss
	@echo $<
	@npx sass --no-source-map $< $@
	@if [ "$<" != "main.scss" ]; then \
		python3 build/render_styles_prune_main.py $@; \
	fi

clean:
	rm -f *.css