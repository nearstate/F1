(function(context) {
	
	context.Form = function(data) {

		var content = JSON.parse(JSON.stringify(data)),
			name = content.name;

		var I = { receive: {}, send: {} };

		var defSectionMap = {
			"input" : InputSection,
			"text" : TextSection,
			"checkbox" : CheckBoxSection
		};

		I.send.logError = function() {};

		I.receive.prettyPrintForm = function(name, container) {
			var toPrint = JSON.stringify(content, null, 3);
			$(container).html(toPrint);
		};
		
		I.receive.renderFormFiller = function(name, container) {
			var form = ensureForm();

			$(".fill-surface-form button").click(function() {
				content.submissionDate = new Date();
				for(var i in inputs) {
					inputs[i].harvestValues();
				}

				$(".fill-surface-form > input").val(JSON.stringify(content));
			});

			var floatPanel = $(".editor-centre-float-panel");

			$(container).empty().data("form-name", name);

			var inputs = [];

			for(var i = 0; i < form.items.length; i++) {
				var item = form.items[i],
					inputSection = null,
					sectionConstructor
					;

				if(!defSectionMap.hasOwnProperty(item["controlDef"])) item.controlDef = "input";

				sectionConstructor = defSectionMap[item["controlDef"]];
				inputSection = new sectionConstructor(floatPanel, item, name, true);

				$(container).append(inputSection.el);

				inputs.push(inputSection);
			}
		};

		I.receive.renderFormEditor = function(name, container) {
			var form = ensureForm();

			$(".edit-surface-form button").click(function() {
				content.version += 1;
				$(".edit-surface-form > input").val(JSON.stringify(content));
			});

			var floatPanel = $(".editor-centre-float-panel");

			$(container).empty()
				.data("form-name", name)
				.append(new InsertControl(floatPanel, I, form.items, null).el);

			function itemDeleteAct(inputSection, inserter, items, item) {
				this.execute = function() {
					inputSection.el.remove();
					inserter.el.remove();
					items.splice(items.indexOf(item), 1);
				};
			}

			for(var i = 0; i < form.items.length; i++) {
				var item = form.items[i],
					inputSection = null,
					insertControl = new InsertControl(floatPanel, I, form.items, item),
					sectionConstructor
					;

				if(!defSectionMap.hasOwnProperty(item["controlDef"])) item.controlDef = "input";

				sectionConstructor = defSectionMap[item["controlDef"]];
				inputSection = new sectionConstructor(floatPanel, item, name);
				item.ondelete = new itemDeleteAct(inputSection, insertControl, form.items, item).execute;

				$(container)
					.append(inputSection.el)
					.append(insertControl.el);
			}
		};

		var filterByFormName = function(topics, data) { return data[0] === name; };

		for(var receiver in I.receive)
			I.receive[receiver].filter = filterByFormName;

		I.get_name = function() { return name; };
		I.get_key = function() { return data.key; };

		I.requestInsert = function(insertionControl, controlDef, items, afterItem) {

			var floatPanel = $($(".editor-centre-float-panel")[0]),
				control,
				item = { "label" : "?", "controlDef" : controlDef }
				;

			sectionConstructor = defSectionMap[item["controlDef"]];

			if(!sectionConstructor) {
				I.send.logError("Unknown control def: " + controlDef);
			} else {
				control = new sectionConstructor(floatPanel, item, "new-section");
				items.splice(items.indexOf(afterItem) + 1, 0, item);
				$(insertionControl.el)
					.before(new InsertControl(floatPanel, I).el)
					.before(control.el);
			}
		};

		return I;

		function ensureForm() {
			if(!content.hasOwnProperty("form")) {
				content.form = { };
			}
			if(!content.form.hasOwnProperty("items")) {
				content.form.items = [];
			}
			if(!content.hasOwnProperty("version")) {
				content.version = 0;
			}
			return content.form;
		}
	};

	function clearSelection() {
		if(document.selection && document.selection.empty) {
			document.selection.empty();
		} else if(window.getSelection) {
			var sel = window.getSelection();
			sel.removeAllRanges();
		}
	}

	function ElementBuilder(templateName, section, hoverPanel, item, formName, forFill) {

		this.buildElement = function() {

			var existing = section.el;
			section.el = $(context.templates[templateName](item));
			if(existing) existing.replaceWith(section.el);

			function doEdit() {
				var itemEditor = new ItemEditor(section.el, item);
				hoverPanel.find(".content").empty().append(itemEditor.el).end().addClass("lock").show();
			}

			function doDelete() {
				var itemDeleter = new ItemDeleter(section.el, item);
				hoverPanel.find(".content").empty().append(itemDeleter.el).end().addClass("lock").show();
			}

			if(!forFill) {
				section.el.mousedown(function(e) { e.preventDefault(); });
			
				section.el.dblclick(function(e) {
					e.preventDefault();
					e.stopPropagation();
					doEdit();
				});

				section.el.click(function(e) {
					var cmd = $(e.srcElement).data("command");
					switch(cmd) {
						case "delete":
							doDelete();
							break;
						case "edit":
							doEdit();
							break;
						default:
							$(this).parent().find("*").removeClass("selected");
							$(this).addClass("selected");
					}
				});
			}

		};

	}

	function TextSection(hoverPanel, item, formName, forFill) {

		var builder = new ElementBuilder(forFill ? "filler-text-section" : "editor-text-section", this, hoverPanel, item, formName, forFill);
		item.onchange = function() { builder.buildElement(); };
		builder.buildElement();
		this.harvestValues = function() {
			item.value = $(this.el).find("textarea").val();
		};
	}

	function InputSection(hoverPanel, item, formName, forFill) {

		var builder = new ElementBuilder(forFill ? "filler-input-section" : "editor-input-section", this, hoverPanel, item, formName, forFill);
		item.onchange = function() { builder.buildElement(); };
		builder.buildElement();
		this.harvestValues = function() {
			item.value = $(this.el).find("input[type=text]").val();
		};
	}

	function CheckBoxSection(hoverPanel, item, formName, forFill) {

		var builder = new ElementBuilder(forFill ? "filler-checkbox-section" : "editor-checkbox-section", this, hoverPanel, item, formName, forFill);
		item.onchange = function() { builder.buildElement(); };
		builder.buildElement();
		this.harvestValues = function() {
			item.value = $(this.el).find("input[type=checkbox]").is(':checked');
		};
	}

	function closeHoverPanel(e) {
		$(e.srcElement).closest(".lock").removeClass("lock").end().closest(".matting").trigger("click");
	}

	function ItemDeleter(controlSection, item) {
		var settables = $(controlSection).closest("section").find(".settable");
		var data = { items: [] };
		for(var i = 0; i < settables.length; i++) {
			data.items.push({
				"name" : $(settables[i]).data("settable"),
				"value" : $(settables[i]).data("settable-value")
			});
		}
		this.el = $(context.templates["editor-item-delete"](data));
		if(this.el.length > 1) this.el = $("<div />").append(this.el);
		this.el.on("click", "button", function(e) {
			var act = $(this).data("command");
			switch(act) {
				case "cancel":
					closeHoverPanel(e);
					break;
				case "delete":
					item.ondelete();
					closeHoverPanel(e);
					break;
			}
		});
	}

	function ItemEditor(controlSection, item) {
		var settables = $(controlSection).closest("section").find(".settable");
		var data = { items: [] };
		for(var i = 0; i < settables.length; i++) {
			data.items.push({
				"name" : $(settables[i]).data("settable"),
				"value" : $(settables[i]).data("settable-value")
			});
		}
		this.el = $(context.templates["editor-item-edit"](data));
		if(this.el.length > 1) this.el = $("<div />").append(this.el);
		this.el.on("click", "button", function(e) {
			var act = $(this).data("command");
			
			switch(act) {
				case "cancel":
					closeHoverPanel(e);
					break;
				case "save":
					$(this).closest(".content").find("input").each(function(i, e) {
						item[$(e).data("settable")] = $(e).val();
					});
					item.onchange();
					closeHoverPanel(e);
					break;
				default:
					break;
			}
		});
	}

	function InsertControl(hoverPanel, form, items, afterItem) {
		var control = this;
		this.el = $(context.templates["editor-insert-control"]());
		this.el.click(function() {
			var palette = new ControlPalette(control);
			hoverPanel.find(".content").empty().append(palette.el).end().show();
		});
		this.requestInsert = function(controlDef) {
			form.requestInsert(control, controlDef, items, afterItem);
		};
	}

	function ControlPalette(insertionControl) {
		this.el = $(context.templates["editor-insert-control-palette"]());
		this.el.click(function(e) {
			var controlDef = $(e.srcElement).data("control-def");
			if(controlDef) insertionControl.requestInsert(controlDef);
		});
	}

})(window.ndf1 = window.ndf1 || {});