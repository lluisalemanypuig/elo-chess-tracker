all: \
	css/buttons.css \
	css/challenges.css \
	css/footers.css \
	css/graphs.css \
	css/home.css \
	css/inputs.css \
	css/labels.css \
	css/main.css \
	css/selects.css \
	css/tables.css \
	css/titles.css

%.css: %.scss css/main.scss
	@echo "Render '$<'"
	@npx sass --no-source-map $< $@
	@if [ "$<" != "css/main.scss" ]; then \
		echo "    Postprocess $<"; \
		python3 build/render_styles_prune_main.py $@; \
	fi

clean:
	rm -f css/*.css