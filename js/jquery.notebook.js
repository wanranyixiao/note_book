/*
 * jQuery Notebook 1.1
 *
 * Copyright (c) 2015
 * date 2015-12-15
 * author rong
 *
 */
if ("undefined" == typeof jQuery) throw new Error("notebook requires jQuery");
!
function(jq) {
	"use strict";
	function Editor(ele,opt){
		this.options = jq.extend({}, Editor.DEFAULTS, jq(ele).data(), "object" == typeof opt && opt), 
		this.browser = Editor.browser(),
		this._id = ++Editor.count, 
		this._events = {}, 
		this.$window = jq(window), 
		this.$document = jq(document), 
		this.$original_element = jq(ele), 
		this.init(ele),
		jq(ele).on("focus." + this._id, jq.proxy(function() {
			for (var b = 1; b <= Editor.count; b++) {
				b != this._id && jq(window).trigger("blur." + b)
			}
		}, this))
	}
	Editor.count = 0,
	Editor.DEFAULTS = {
		buttons: ["fontFamily","fontSize","bold", "italic", "underline","foreColor", "backColor","space","justifyLeft","justifyRight","justifyCenter","justifyFull", "insertOrderedList", "insertUnorderedList", "outdent","space", "indent", "createLink","selectAll", "removeFormat","undo", "redo"],
		colors : ["#000000", "#444444", "#666666", "#999999", "#CCCCCC", "#EEEEEE", "#F3F3F3", "#FFFFFF", "#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#9900FF", "#FF00FF", "#F4CCCC", "#FCE5CD", "#FFF2CC", "#D9EAD3", "#D0E0E3", "#CFE2F3", "#D9D2E9", "#EAD1DC", "#EA9999", "#F9CB9C", "#FFE599", "#B6D7A8", "#A2C4C9", "#9FC5E8", "#B4A7D6", "#D5A6BD", "#E06666", "#F6B26B", "#FFD966", "#93C47D", "#76A5AF", "#6FA8DC", "#8E7CC3", "#C27BA0", "#CC0000", "#E69138", "#F1C232", "#6AA84F", "#45818E", "#3D85C6", "#674EA7", "#A64D79", "#990000", "#B45F06", "#BF9000", "#38771D", "#134F5C", "#0B5394", "#351C75", "#741B47", "#660000", "#783F04", "#7F6000", "#274E13", "#0C343D", "#073763", "#201211", "#4C1130"],
		fontFamily:['微软雅黑','Serif','Sans','Arial','Arial Black','Courier','Courier New','Comic Sans MS','Helvetica','Impact','Lucida Grande','Lucida Sans','Tahoma','Times','Times New Roman','Verdana'],
		editorClass: "",
		height: "auto",
		inlineMode: !0,
		clickShow: !1,
		tabSpaces: !1,
		tabLength:2,
		paragraphy: !0,
		placeholder: "请在此输入文字",
		mode: 'multiline',
		hotkeys: !0,
		hotkeysAvailable: ["bold", "italic", "underline","undo","redo","justifyRight","justifyFull","justifyLeft","justifyCenter"],
		width: "auto",
		zIndex: 1e3
	}, 
	Editor.prototype.hotkeys_map = {
		66 : 'bold',//ctrl+b meta+b
        73 : 'italic', //ctrl+i meta+i
        85 : 'underline', //ctrl+u meta+u
        90 : 'undo',  //ctrl+z meta+z
        89 : 'redo',  //ctrl+y meta+y
        76 : 'justifyLeft',  //ctrl+l meta+l
        82 : 'justifyRight',  //ctrl+r meta+r
        69 : 'justifyCenter',  //ctrl+e meta+e
        74 : 'justifyFull',  //ctrl+j meta+j
        65 :'selectAll'  //ctrl+a meta+a
	}, 
	Editor.prototype.setPlaceholder = function(holder) {
		holder && (this.options.placeholder = holder), 
		this.$textarea && this.$textarea.attr("placeholder", this.options.placeholder), 
		this.$element.attr("data-placeholder", this.options.placeholder)
	}, 
	Editor.prototype.setPlaceholderEvent = function() {
		this.$element.on("keyup keydown focus placeholderCheck", jq.proxy(function(e) {
			return this.checkPlaceholder()
		}, this)),
		this.$element.trigger("placeholderCheck");
	},
	Editor.prototype.checkPlaceholder = function() {
		if (this.isEmpty()) {
			var c, focus = this.selectionInEditor() || this.$element.is(":focus");
			this.options.paragraphy ? (c = jq("<p><br/></p>"), this.$element.html(c), focus && this.setSelection(c.get(0)), this.$element.addClass("n-placeholder")) : (0 === this.$element.find("br").length && this.$element.append("<br/>"), this.$element.addClass("n-placeholder"))
		} else{
			!this.$element.find("p").length && this.options.paragraphy ? (this.$element.find("p").length && "" === this.text() ? this.setSelection(this.$element.find("p")[0], this.$element.find("p").text().length, null, this.$element.find("p").text().length) : this.$element.removeClass("n-placeholder")) : "" === this.$element.text() ? this.$element.addClass("n-placeholder") : this.$element.removeClass("n-placeholder");
		}
		return !0
	}, 
	Editor.prototype.webkitParagraphy = function() {
		this.$element.find("*").each(jq.proxy(function(b, tag) {
			if (this.emptyElement(tag) && "DIV" === tag.tagName && this.options.paragraphy === !0) {
				var p = jq("<p><br/></p>");
				jq(tag).replaceWith(p)
			}
		}, this))
	}, 
	Editor.prototype.emptyElement = function(tag) {
		if ("IMG" == tag.tagName || jq(tag).find("img").length > 0) return !1;
		if (jq(tag).find("input, iframe").length > 0) return !1;
		for (var c = jq(tag).text(), i = 0; i < c.length; i++) 
			if ("\n" !== c[i] && "\r" !== c[i] && "	" !== c[i]) return !1;
		return !0
	}, 
	Editor.prototype.initOnTextarea = function(ele) {
		this.$textarea = jq(ele), 
		void 0 !== this.$textarea.attr("placeholder") && (this.options.placeholder = this.$textarea.attr("placeholder")), 
		this.$element = jq("<div>").html(this.$textarea.val()), 
		this.$textarea.before(this.$element).hide();
	},
	Editor.prototype.initOnDefault = function(ele) {
		"DIV" == ele.tagName ? this.$element = jq(ele) : this.editableDisabled = !1
	},  
	Editor.prototype.initElement = function(ele) {
		"TEXTAREA" == ele.tagName ? this.initOnTextarea(ele) : this.initOnDefault(ele), 
		this.editableDisabled || 
		(this.$box = this.$element, 
			this.$element = jq("<div>"), 
			this.$element.html(this.$box.html()),
			this.$box.html(this.$element).addClass("notebook-box"), 
			this.$element.on("keyup", jq.proxy(function(e) {
				var key = e.which;
				13 == key && this.webkitParagraphy()
			}, this)))
	}, 
	Editor.prototype.initElementStyle = function() {
		this.editableDisabled || this.$element.attr("contenteditable", !0);
		var clzss = "jquery-notebook editor " + this.options.editorClass;
		this.browser.msie && Editor.getIEversion() < 9 && (clzss += " ie8"), this.$element.css("outline", 0), this.browser.msie || (clzss += " not-msie"), this.$element.addClass(clzss)
	},
	Editor.prototype.initBasicEditor = function() {
		this.$bubble.insertBefore(this.$element),
		this.$popup_bubble = this.$bubble.clone(), 
		this.$bubble.addClass("note-basic"),
		this.$bubble.show()
	}, 
	Editor.prototype.initInlineEditor = function() {
		jq("body").append(this.$bubble), 
		this.$bubble.addClass("note-inline"),
		this.$popup_bubble = this.$bubble
	}, 
	Editor.prototype.initBubble = function() {
		var c = "jquery-notebook bubble";
		this.browser.msie && Editor.getIEversion() < 9 && (c += " ie8"),
		this.$bubble = jq('<div class="' + c + '" style="display: none;">'), 
		this.options.inlineMode ? this.initInlineEditor() : this.initBasicEditor()
	}, 
	Editor.prototype.buildDefaultButton = function(command){
		return '<button type="button" class="bttn" title="'+command.title+'" data-cmd="'+command.cmd+'"><i class="'+command.icon+'"></i></button>';
	},
	Editor.prototype.buildDropMenuButton = function(command,child){
		return '<div class="bttn dropdown '+command.menu+'"><button type="button" class="bttn n-trigger" title="'+command.title+'" data-name="'+command.cmd+'"><i class="'+command.icon+'"></i></button>'+child+'</div>'
	},
	Editor.prototype.initLinkMenuButton = function(command){
		var child = '<div class="dropdown-menu link-area"><input type="text" name="link" /><button class="add-link"><i class="fa fa-check"></i></button><button class="close-link"><i class="fa fa-close"></i></button></div>';
		return '<div class="bttn dropdown '+command.menu+'"><button type="button" class="bttn" title="'+command.title+'" data-name="'+command.cmd+'"><i class="'+command.icon+'"></i></button>'+child+'</div>'
	},
	Editor.prototype.bindButtonEvents = function(){
		this.$bubble_bttn.on("keydown",".link-area input[name='link']",jq.proxy(function(e){
			if (e.which === 13) {
				e.stopPropagation();
				e.preventDefault();
				this.$bubble_bttn.find(".dropdown .add-link").trigger("mouseup");
			}
		},this)),
		this.$bubble_bttn.on("mouseup touchend",".dropdown .add-link",jq.proxy(function(e){
			e.stopPropagation();
			e.preventDefault();
            this.restoreSelection();
			var input = this.$bubble_bttn.find('.link-area input[name="link"]');
            if (jq.Notebook.isUrl(input.val())) {
            	this.execCommand('createLink',input.val()),
           		this.hideMenu("n-link");
            } else if (input.val() === '' && this.getSelectionLink() != null) {
                var el = $(this.getSelectionParent()).closest('a');
                el.contents().first().unwrap(),
           		this.hideMenu("n-link");
            }else
            	input.addClass("error");
		},this)),
		this.$bubble_bttn.on("mouseup touchend",".dropdown .close-link",jq.proxy(function(e){
			e.stopPropagation();
            this.restoreSelection();
			this.hideMenu("n-link");
		},this)),
		this.$bubble_bttn.on("mouseup touchend", "button[data-cmd], span[data-cmd], a[data-cmd]", jq.proxy(function(e) {
			e.stopPropagation();
			var target = e.currentTarget;
			var cmd = jq(target).data("cmd"),val = jq(target).data("val");
			this.exec(cmd,val);
		}, this))
	},
	Editor.prototype.bindMenuButtonEvents = function(){
		this.$bubble_bttn.on("mouseup touchend", ".dropdown button[data-name]", jq.proxy(function(e) {
			e.preventDefault();
			e.stopPropagation();
			var target = e.currentTarget, cmd = jq(target).data("name");
			var menu = Editor.commands[cmd].menu, 
			claz = menu.split(" ").join("."), 
			panel = this.$bubble_bttn.find("."+claz+" .dropdown-menu");
			panel && panel.css("display") === "block" ? panel.hide() : (this.hideMenu(),panel.show());
			if(menu === 'n-link'){
				this.saveSelection();
				var input = this.$bubble_bttn.find('.link-area input[name="link"]');
				input.removeClass("error");
				var link = this.getSelectionLink();
				link != null ? input.val(link || "") : input.val("http://");
				input.focus();
			}
		}, this))
	}, 
	Editor.prototype.initOptions = function(){
		this.$bubble.css("z-index", this.options.zIndex),
		this.$bubble.append('<div class="bttn-wrapper" id="bttn-wrapper-' + this._id + '">'), 
		this.$bubble_bttn = this.$bubble.find("#bttn-wrapper-"+ this._id);
		for (var bttns = '', child = '', i = 0; i < this.options.buttons.length; i++) {
			var button = this.options.buttons[i];
			if ("space" != button) {
				var command = Editor.commands[button];
				if (void 0 !== command) {
					command.cmd = button;
					var dispat = this.command_dispatcher[command.cmd];
					dispat ? (child = dispat.apply(this, [command]), bttns += this.buildDropMenuButton(command,child)) : (button === 'createLink' ? bttns += this.initLinkMenuButton(command) : bttns += this.buildDefaultButton(command)),
					this.bindRefreshListener(command);
				}
			}else
			bttns += this.options.inlineMode ? '<div class="clear-both"></div><hr/>' : ''
		}
		bttns += '', this.$bubble_bttn.html(bttns),
		this.$bubble_bttn.find('button[data-cmd="undo"], button[data-cmd="redo"]').prop("disabled", !0), 
		this.bindMenuButtonEvents(),this.bindButtonEvents()
	},
	Editor.prototype.init = function(ele) {
		this.initElement(ele), 
		this.initElementStyle(),
		this.editableDisabled || (this.initHotKeys(),this.initBubble()), 
		this.editableDisabled || (this.setPlaceholder(this.options.placeholder), this.setPlaceholderEvent()),
		this.editableDisabled || (this.initEditorSelection(),this.initOptions(),this.initTabEvent(),this.initPasteEvent())
	}, 
	Editor.prototype.buildDropMenuFontFamily = function(command){
		for (var ul = '<ul class="dropdown-menu">', font = this.options.fontFamily,i = 0;i<font.length;i++)
			ul += '<li><button type="button" class="n-li-bttn" data-val="'+ font[i] +'" data-cmd="'+command.cmd+'" style="font-family: \''+font[i]+'\'" >'+font[i]+'</button></li>';
		return ul += "</ul>"
	},
	Editor.prototype.buildDropMenuFontSize = function(command){
		for (var ul = '<ul class="dropdown-menu">', i = 0; i < command.seed.length; i++) 
			for (var s = command.seed[i], j = s.min; j <= s.max; j++) 
				ul += '<li><button type="button" class="n-li-bttn" data-val="' + j + 'px" data-cmd="'+command.cmd+'">' + j + 'px</button></li>';
		return ul += "</ul>"
	},
	Editor.prototype.buildDropMenuColor = function(command){
		for (var ul = '<div class="dropdown-menu color-menu"><div class="n-color"><p><a data-val="transparent" data-cmd="'+command.cmd+'" title="Clear"><i class="fa fa-eraser"></i></a></p>', color = this.options.colors, i = 0; i < color.length; i++){
			if(i>0 && i%8 == 0) ul += '<br/>';
			ul += '<button type="button" class="n-color-bttn" data-val="'+ color[i] +'" data-cmd="'+command.cmd+'" style="background-color: '+color[i]+';">&nbsp;</button>';
		}
		return ul += "</div></div>"
	},
	Editor.prototype.command_dispatcher = {
		fontFamily: function(command) {
			return this.buildDropMenuFontFamily(command);
		},
		fontSize : function(command){
			return this.buildDropMenuFontSize(command);
		},
		foreColor : function(command){
			return this.buildDropMenuColor(command);
		},
		backColor : function(command){
			return this.buildDropMenuColor(command);
		}
	}

	var note = jq.fn.notebook;
	$.fn.notebook = function(opt) {
		for (var d = [], e = 0; e < arguments.length; e++) d.push(arguments[e]);
		if ("string" == typeof opt) {
			var arr = [];
			return this.each(function() {
				var ele = jq(this),
					data = ele.data("n.notebook");
				if (!data[opt]) 
					return jq.error("Method " + opt + " does not exist in notebook.");
				var fn = data[opt].apply(data, d.slice(1));
				void 0 === fn ? arr.push(this) : 0 === arr.length && arr.push(fn)
			}), 
			1 == arr.length ? arr[0] : arr
		}
		return "object" != typeof opt && opt ? void 0 : this.each(function() {
			var _this = this,
				ele = jq(_this),
				data = jq(_this).data("n.notebook");
			data || ele.data("n.notebook", data = new Editor(_this, opt));
		})
    };
	jq.Notebook = Editor, jq.fn.notebook.noConflict = function() {
		return jq.fn.notebook = note, this
	}
}(window.jQuery),
function(jq){
	jq.Notebook.prototype.refreshDefault = function(cmd) {
		try {
			document.queryCommandState(cmd) === !0 && this.$bubble.find('[data-cmd="' + cmd + '"]').addClass("active")
		} catch (e) {}
	}, 
	jq.Notebook.prototype.addListener = function(event, fn) {//注册事件
		var events = this._events,
			e = events[event] = events[event] || [];
		e.push(fn);
	}, 
	jq.Notebook.prototype.raiseEvent = function(event, args) {//执行注册事件
		void 0 === args && (args = []);
		var result = !0,
			fns = this._events[event];
		if (fns) for (var i = 0, l = fns.length; l > i; i++) {
			var r = fns[i].apply(this, args);
			void 0 !== r && (result = r)
		}
		return void 0 === result && (result = !0), result
	},
	jq.Notebook.commands = {
		fontFamily: {
			title: "Font Family",
			icon: "fa fa-font",
			menu : "n-family",
			callback: function(cmd, val) {
				this.execFont("font-family", cmd, val)
				this.hideMenu("n-family");
			}
		},
		fontSize: {
			title: "Font Size",
			icon: "fa fa-text-height",
			menu : "n-size",
			seed: [{
				min: 11,
				max: 52
			}],
			callback: function(cmd, val) {
				this.execFont("font-size", cmd, val)
				this.hideMenu("n-size");
			}
		},
		bold: {
			title: "Bold",
			icon: "fa fa-bold",
			refresh: jq.Notebook.prototype.refreshDefault,
			shortcut: "(Ctrl + B)"
		},
		italic: {
			title: "Italic",
			icon: "fa fa-italic",
			refresh: jq.Notebook.prototype.refreshDefault,
			shortcut: "(Ctrl + I)"
		},
		underline: {
			title: "Underline",
			icon: "fa fa-underline",
			refresh: jq.Notebook.prototype.refreshDefault,
			shortcut: "(Ctrl + U)"
		},
		foreColor:{
			icon: "fa fa-font fore-color",
			title: "Fore Color",
			menu:"n-color fore-color",
			callback: function(cmd, val) {
				this.execCommand(cmd,val);
				this.hideMenu("n-color fore-color");
			}
		},
		backColor:{
			icon: "fa fa-font back-color",
			title: "Back Color",
			menu:"n-color back-color",
			callback: function(cmd, val) {
				this.execCommand(cmd,val);
				this.hideMenu("n-color back-color");
			}
		},
		justifyLeft:{
			title: "Align Left",
			icon: "fa fa-align-left",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		justifyCenter:{
			title: "Align Center",
			icon: "fa fa-align-center",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		justifyRight:{
			title: "Align Right",
			icon: "fa fa-align-right",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		justifyFull:{
			title: "Justify",
			icon: "fa fa-align-justify",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		outdent: {
			title: "Indent Less",
			icon: "fa fa-dedent",
			shortcut: "(Tab)",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		indent: {
			title: "Indent More",
			icon: "fa fa-indent",
			activeless: !0,
			shortcut: "(Shift + Tab)",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		insertOrderedList:{
			title: "Insert OrderedList",
			icon: "fa fa-list-ol",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		insertUnorderedList:{
			title: "Insert UnorderedList",
			icon: "fa fa-list-ul",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		createLink: {
			title: "Insert Link",
			icon: "fa fa-link",
			menu : "n-link"
		},
		selectAll : {
			title: "Select All",
			icon: "fa fa-file-text",
			shortcut: "(Ctrl+A)",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		undo: {
			title: "Undo",
			icon: "fa fa-undo",
			shortcut: "(Ctrl+Z)",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		redo: {
			title: "Redo",
			icon: "fa fa-repeat",
			shortcut: "(Ctrl+Y)",
			refresh: jq.Notebook.prototype.refreshDefault,
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		},
		removeFormat:{
			title: "RemoveFormat",
			icon: "fa fa-eraser",
			callbackWithoutSelection:function(command){
				this.execCommandDefault(command);
			}
		}
	}
}(jQuery),
function(jq) {
	jq.Notebook.prototype.getBoundingRect = function() {
		var b;
		if (!this.getRange().collapsed)
			b = this.getRange().getBoundingClientRect();
		return b
	}, 
	jq.Notebook.prototype.repositionEditor = function() {
		var rect, x, y;
		if (this.options.inlineMode) {
			if (rect = this.getBoundingRect(), rect && (rect.ok || rect.left >= 0 && rect.top >= 0 && rect.right > 0 && rect.bottom > 0)) 
				x = rect.left + rect.width / 2, 
				y = rect.top + rect.height, 
				x += jq(window).scrollLeft(), 
				y += jq(window).scrollTop(), 
				this.showByCoordinates(x, y);
			else if (this.options.clickShow) this.hide();
			else {
				var f = this.$element.offset();
				this.showByCoordinates(f.left, f.top + 10)
			}
			0 === this.options.buttons.length && this.hide()
		}
	}, 
	jq.Notebook.prototype.showByCoordinates = function(mouseX, mouseY) {
		mouseX -= 20, mouseY += 15;
		var bubbleW = Math.max(this.$popup_bubble.width(), 250);
		mouseX + bubbleW >= jq(window).width() - 50 && mouseX + 40 - bubbleW > 0 ? 
			(this.$popup_bubble.addClass("right-side"), 
				mouseX = jq(window).width() - (mouseX + 40), 
				this.$popup_bubble.css("top", mouseY), 
				this.$popup_bubble.css("right", mouseX), 
				this.$popup_bubble.css("left", "auto")) : 
			mouseX + bubbleW < jq(window).width() - 50 ? 
				(this.$popup_bubble.removeClass("right-side"), 
					this.$popup_bubble.css("top", mouseY), 
					this.$popup_bubble.css("left", mouseX), 
					this.$popup_bubble.css("right", "auto")) : 
				(this.$popup_bubble.removeClass("right-side"), 
					this.$popup_bubble.css("top", mouseY), 
					this.$popup_bubble.css("left", Math.max(jq(window).width() - bubbleW, 10) / 2), 
					this.$popup_bubble.css("right", "auto")), 
				this.$popup_bubble.show()
	}, 
	jq.Notebook.prototype.show = function(e) {
		if (this.options.inlineMode) {
			if (void 0 !== e) 
				if (null !== e && "touchend" !== e.type) {
					var mouseX = e.pageX,
						mouseY = e.pageY;
					mouseX < this.$element.offset().left && 
						(mouseX = this.$element.offset().left), 
						mouseX > this.$element.offset().left + this.$element.width() && 
						(mouseX = this.$element.offset().left + this.$element.width()), 
						mouseY < this.$element.offset.top && 
						(mouseY = this.$element.offset().top), 
						mouseY > this.$element.offset().top + this.$element.height() && 
						(mouseY = this.$element.offset().top + this.$element.height()), 
						20 > mouseX && (mouseX = 20), 
						0 > mouseY && (mouseY = 0), 
						this.showByCoordinates(mouseX, mouseY), 
						jq(".jquery-notebook.bubble.note-inline").hide(), 
						this.$bubble.show(), 
						0 !== this.options.buttons.length || this.$bubble.hide()
				} else {
					jq(".jquery-notebook.bubble.note-inline").hide(), 
					this.repositionEditor(),
					this.$bubble.show();
				}
			else{
				jq(".jquery-notebook.bubble.note-inline").hide(), 
				this.repositionEditor(),
				this.$bubble.show();
			}
			this.refreshButtons();
		}
	},
	jq.Notebook.prototype.hide = function() {
		return this.$popup_bubble.hide()
	},
	jq.Notebook.prototype.destroy = function() {
		this.hide(), 
		this.focus(), 
		this.clearSelection(),
		this.$element.blur(), 
		this.$bubble_bttn && this.$bubble_bttn.html("").removeData().remove(), 
		this.$bubble && this.$bubble.html("").removeData().remove(), 
		this.$popup_bubble && this.$popup_bubble.html("").removeData().remove(), 
		this.$element.off("mousedown mouseup click keydown keyup focus keypress touchstart touchend touch"), 
		this.$element.off("mousedown mouseup click keydown keyup focus keypress touchstart touchend touch", "**"), 
		jq(window).off("mouseup." + this._id), 
		jq(window).off("hide." + this._id),
		this.$textarea && (this.$box.remove(), this.$textarea.removeData("n.notebook"), this.$textarea.show());
		for (var i in this._events) delete this._events[i];
		this.$element.replaceWith(this.$element.html()), 
		this.$box && (this.$box.removeClass("notebook-box"), this.$box.removeData("n.notebook"))
	},
	jq.Notebook.prototype.initEditorSelection = function(){
		this.$element.on("mousedown touchstart", jq.proxy(function(e) {
			e.stopPropagation();
			this.$element.focus()
		}, this)), 
		this.$element.on("mouseup touchend", jq.proxy(function(e) {
			e.stopPropagation();
			this.hideOtherEditors(),
			this.refreshButtons() , this.hideMenu();
			var selectText = this.text();
			!("" !== selectText || this.options.clickShow && this.options.inlineMode) || 
			setTimeout(jq.proxy(function() {
				selectText = this.text(), 
				!("" !== selectText || this.options.clickShow && this.options.inlineMode) || this.show(e)
			}, this), 20)
		}, this)),
		this.$element.on("keyup",jq.proxy(function(e){
			if (e.shiftKey && e.which >= 37 && e.which <= 40) {
				this.show();
			}
			this.options.clickShow && this.hide()
		},this)),
		this.setWindowHideEvent(),
		this.setWindowMouseUpEvent()
	},
	jq.Notebook.prototype.setWindowHideEvent = function() {
		this.$window.on("hide." + this._id, jq.proxy(function() {
			this.hide(!1)
		}, this))
	}, 
	jq.Notebook.prototype.setWindowMouseUpEvent = function() {
		this.$window.on("mouseup." + this._id, jq.proxy(function() {
			return (this.$bubble_bttn.find("button[data-cmd]").removeClass("active"), this.selectionInEditor() && "" !== this.text() ? this.show(null) : this.$popup_bubble.is(":visible") && this.hide())
		}, this))
	}, 
	jq.Notebook.prototype.initPasteEvent = function(){
		this.$element.on("paste",jq.proxy(function(){
			var _this = this,
				id = 'jqeditor-temparea',
                temp = $('#' + id);
                _this.saveSelection();
            if (temp.length < 1) {
                var body = $('body');
                temp = $('<div contenteditable="true" style="position: fixed; top: 0; left: -9999px; height: 100%; width: 0; z-index: 99999;"></div>');
                temp.attr('id', id);
                body.append(temp);
            }
            temp.focus();
            setTimeout(function() {
                var clipboardContent = '',
                    paragraphs = temp.text().split('\n');
                for(var i = 0; i < paragraphs.length; i++) {
                    clipboardContent += ['<p>', paragraphs[i], '</p>'].join('');
                }
                temp.html(''),
                _this.restoreSelection(),
                _this.insertHTML(clipboardContent);
                _this.$element.trigger("placeholderCheck");
            }, 500);
		},this))
	},
	jq.Notebook.prototype.bindRefreshListener = function(command) {
		command.refresh && this.addListener("refresh", jq.proxy(function() {
			command.refresh.apply(this, [command.cmd])
		}, this))
	},
	jq.Notebook.prototype.initHotKeys = function() {
		this.options.hotkeys && this.$element.on("keydown", jq.proxy(function(e) {
			var code = e.which,
				key = (e.ctrlKey || e.metaKey) && !e.altKey;
			if (key) {
				if (this.hotkeys_map[code] && this.hotkeysEnabled(this.hotkeys_map[code])){
					e.preventDefault();
                    e.stopPropagation();
					this.execDefaultHotKeys.apply(this, this.hotkeys_map[code].split(" "));
				}
			}
		}, this))
	}, 
	jq.Notebook.prototype.initTabEvent = function(){
		this.$element.on("keydown",jq.proxy(function(e){
			this.$bubble_bttn.find('button[data-cmd="undo"], button[data-cmd="redo"]').prop("disabled", !1);
			var key = e.which;
			if(9 == key && !e.shiftKey){
				if (this.options.tabSpaces){
					e.preventDefault();
                    e.stopPropagation();
					var space = "",ele = this.getSelectionElements()[0];
					for(var l = this.options.tabLength,i=0;i<l;i++)
						space += "&nbsp;"; 
					"PRE" === ele.tagName && (space = "  "), this.insertHTML(space, !1)
				}else{
					e.preventDefault();
                    e.stopPropagation();
                    document.execCommand('indent', !1, !0)
				}
			}else if(9 == key && e.shiftKey){
				e.preventDefault();
                e.stopPropagation();
                document.execCommand('outdent', !1, !0)
			}
		},this))
	},
	jq.Notebook.prototype.hideMenu = function(menu){
		var c;
		arguments.length>0 ?(c = arguments[0].split(' ').join('.'), this.$bubble_bttn.find("."+c+" .dropdown-menu").hide()) : this.$bubble_bttn.find(".dropdown-menu").hide();
	},
	jq.Notebook.prototype.isEnabled = function(command) {
		return jq.inArray(command, this.options.buttons) >= 0
	}, 
	jq.Notebook.prototype.hotkeysEnabled = function(key) {
		return this.options.hotkeysAvailable.indexOf(key) >= 0
	}, 
	jq.Notebook.prototype.isEmpty = function() {
		var a = this.$element.text().replace(/(\r\n|\n|\r|\t|\u0020)/gm, "");
		return "" === a  && 0 === this.$element.find("p > br").length && 0 === this.$element.find("li, h1, h2, h3, h4, h5, h6").length
	}, 
	jq.Notebook.prototype.text = function() {
		var sele = "";
		return window.getSelection ? sele = window.getSelection() : document.getSelection ? sele = document.getSelection() : document.selection && (sele = document.selection.createRange().text), sele.toString()
	}, 
	jq.Notebook.prototype.focus = function(){
		return !this.$element.is(":focus") && this.$element.focus();
	}, 
	jq.Notebook.prototype.exec = function(command, val) {
		this.$bubble_bttn.find('button[data-cmd="undo"], button[data-cmd="redo"]').prop("disabled", !1);
		return this.selectionInEditor() || this.focus(), this.selectionInEditor() && "" === this.text() &&
			jq.Notebook.commands[command].callbackWithoutSelection ? (jq.Notebook.commands[command].callbackWithoutSelection.apply(this, [command, val]),!1) : (jq.Notebook.commands[command].callback ? jq.Notebook.commands[command].callback.apply(this, [command, val]) : this.execCommand(command, val))
			
	}, 
	jq.Notebook.prototype.execFont = function(type, cmd, val) {
		if ("font-size" != type) {
			document.execCommand("FontName", 0, val);
			var fontElements = this.$element.find("font");
            for (var i = 0, len = fontElements.length; i < len; ++i) {
                if (fontElements[i].face == val) {
                    fontElements[i].removeAttribute("face");
                    fontElements[i].style.fontFamily = val;
                }
            }
		}else{
			document.execCommand("fontSize", 0, "4");
            var fontElements = this.$element.find("font");
            for (var i = 0, len = fontElements.length; i < len; ++i) {
                if (fontElements[i].size == "4") {
                    fontElements[i].removeAttribute("size");
                    fontElements[i].style.fontSize = val;
                }
            }
		}
	},
	jq.Notebook.prototype.execDefaultHotKeys = function(command, val) {
		return this.isEnabled(command) ? (this.exec(command, val), !1) : !0
	}, 
	jq.Notebook.prototype.execCommand = function(command, val) {
		document.execCommand(command, !1, val),this.refreshButtons()
	}, 
	jq.Notebook.prototype.execCommandDefault = function(command) {
		this.focus(), document.execCommand(command, !1, !0),this.refreshButtons()
	}, 
	jq.Notebook.prototype.refreshButtons = function(btn){
		if (!(this.selectionInEditor() && jq.Notebook.getIEversion() < 9 || btn)) return !1;
		this.$bubble.find("button[data-cmd]").removeClass("active");
		//执行各个button的refresh事件
		this.raiseEvent("refresh",btn)
	},
	jq.Notebook.prototype.hideOtherEditors = function() {
		for (var i = 1; i <= jq.Notebook.count; i++) 
			i != this._id && jq(window).trigger("hide." + i)
	}, 
	jq.Notebook.prototype.insertHTML = function(html, flag) {
		void 0 === flag && (flag = !0), flag && this.focus();
		var sele, range;
		if (window.getSelection) {
			if (sele = window.getSelection(), sele.getRangeAt && sele.rangeCount) {
				range = sele.getRangeAt(0), range.deleteContents();
				var ele = document.createElement("div");
				ele.innerHTML = html;
				for (var text, res, frag = document.createDocumentFragment(); text = ele.firstChild;) 
					res = frag.appendChild(text);
				range.insertNode(frag), 
				res && (range_new = range.cloneRange(), range_new.collapse(!1), sele.removeAllRanges(), sele.addRange(range_new))
			}
		} else if ((sele = document.selection) && "Control" != sele.type) {
			var ran = sele.createRange();
			ran.collapse(!0), 
			sele.createRange().pasteHTML(html), 
			range = sele.createRange(), range.setEndPoint("StartToStart", ran), range.select()
		}
	},
	jq.Notebook.getIEversion = function() {
		var agent, reg, v = -1;
		return "Microsoft Internet Explorer" == navigator.appName ? (agent = navigator.userAgent, reg = new RegExp("MSIE ([0-9]{1,}[\\.0-9]{0,})"), null !== reg.exec(agent) && (v = parseFloat(RegExp.$1))) : "Netscape" == navigator.appName && (agent = navigator.userAgent, reg = new RegExp("Trident/.*rv:([0-9]{1,}[\\.0-9]{0,})"), null !== reg.exec(agent) && (v = parseFloat(RegExp.$1))), v
	}, 
	jq.Notebook.browser = function() {
		var a = {};
		if (this.getIEversion() > 0) a.msie = !0;
		else {
			var agent = navigator.userAgent.toLowerCase(),
				brow = /(chrome)[ \/]([\w.]+)/.exec(agent) || /(webkit)[ \/]([\w.]+)/.exec(agent) || /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(agent) || /(msie) ([\w.]+)/.exec(agent) || agent.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(agent) || [],
				d = {
					browser: brow[1] || "",
					version: brow[2] || "0"
				};
			brow[1] && (a[d.browser] = !0), parseInt(d.version, 10) < 9 && a.msie && (a.oldMsie = !0), a.chrome ? a.webkit = !0 : a.webkit && (a.safari = !0)
		}
		return a
	},
	jq.Notebook.isUrl = function(url) {
        return (/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/).test(url);
    }
}(jQuery),
function(jq) { 
	jq.Notebook.prototype.getRange = function() {
		var ranges = this.getRanges();
		return ranges.length > 0 ? ranges[0] : null
	}, 
	jq.Notebook.prototype.getRanges = function() {
		var selection = this.getSelection();
		if (selection.getRangeAt && selection.rangeCount) {
			for (var arr = [], i = 0; i < selection.rangeCount; i++) 
				arr.push(selection.getRangeAt(i));
			return arr
		}
		return document.createRange ? [document.createRange()] : []
	}, 
	jq.Notebook.prototype.getSelection = function() {
		var selection = "";
		return selection = window.getSelection ? window.getSelection() : document.getSelection ? document.getSelection() : document.selection.createRange()
	}, 
	jq.Notebook.prototype.setSelection = function(start1, start2, end1, end2) {
		var sel = this.getSelection();
		if (sel) {
			this.clearSelection();
			try {
				end1 || (end1 = start1), 
				void 0 === start2 && (start2 = 0), 
				void 0 === end2 && (end2 = start2);
				var range = this.getRange();
				range.setStart(start1, start2), 
				range.setEnd(end1, end2), 
				sel.addRange(range)
			} catch (g) {}
		}
	},
	jq.Notebook.prototype.saveSelection = function() {
		this.savedRanges = [];
		for (var arr = this.getRanges(), i = 0; i < arr.length; i++) 
			this.savedRanges.push(arr[i].cloneRange())
	}, 
	jq.Notebook.prototype.restoreSelection = function() {
		var i, l, selection = this.getSelection();
		if (this.savedRanges && this.savedRanges.length) 
			for (selection.removeAllRanges(), i = 0, l = this.savedRanges.length; l > i; i += 1) 
				selection.addRange(this.savedRanges[i])
		
	}, 
	jq.Notebook.prototype.clearSelection = function() {
		var selection = this.getSelection();
		try {
			selection.removeAllRanges ? selection.removeAllRanges() : selection.empty ? selection.empty() : selection.clear && selection.clear()
		} catch (e) {}
	}, 
	jq.Notebook.prototype.selectionInEditor = function() {
		var parent = this.getSelectionParent(),
			flag = !1;
		return parent == this.$element.get(0) && (flag = !0), 
		flag === !1 && jq(parent).parents().each(jq.proxy(function(i, e) {
			e == this.$element.get(0) && (flag = !0)
		}, this)), flag
	}, 
	jq.Notebook.prototype.getSelectionParent = function() {
		var selection, ele = null;
		return window.getSelection ? (selection = window.getSelection(), selection.rangeCount && (ele = selection.getRangeAt(0).commonAncestorContainer, 1 != ele.nodeType && (ele = ele.parentNode))) : (selection = document.selection) && "Control" != selection.type && (ele =selection.createRange().parentElement()), 
		null != ele && (jq.inArray(this.$element.get(0), jq(ele).parents()) >= 0 || ele == this.$element.get(0)) ? ele : null
	},
	jq.Notebook.prototype.getSelectionLink = function() {
		var links = this.getSelectionLinks();
		return links.length > 0 ? jq(links[0]).attr("href") : null
	}, 
	jq.Notebook.prototype.getSelectionLinks = function() {
		var a, b, c, d, e = [];
		if (window.getSelection) {
			var f = window.getSelection();
			if (f.getRangeAt && f.rangeCount) {
				d = document.createRange();
				for (var g = 0; g < f.rangeCount; ++g) if (a = f.getRangeAt(g), b = a.commonAncestorContainer, b && 1 != b.nodeType && (b = b.parentNode), b && "a" == b.nodeName.toLowerCase()) e.push(b);
				else {
					c = b.getElementsByTagName("a");
					for (var h = 0; h < c.length; ++h) d.selectNodeContents(c[h]), d.compareBoundaryPoints(a.END_TO_START, a) < 1 && d.compareBoundaryPoints(a.START_TO_END, a) > -1 && e.push(c[h])
				}
			}
		} 
		else if (document.selection && "Control" != document.selection.type) 
			if (a = document.selection.createRange(), b = a.parentElement(), "a" == b.nodeName.toLowerCase()) 
				e.push(b);
		else {
			c = b.getElementsByTagName("a"), d = document.body.createTextRange();
			for (var i = 0; i < c.length; ++i) 
				d.moveToElementText(c[i]), d.compareEndPoints("StartToEnd", a) > -1 && d.compareEndPoints("EndToStart", a) < 1 && e.push(c[i])
		}
		return e
	},
	jq.Notebook.prototype.nextNode = function(start, end) {
		if (start.hasChildNodes()) return start.firstChild;
		for (; start && !start.nextSibling && start != end;) start = start.parentNode;
		return start && start != end ? start.nextSibling : null
	}, 
	jq.Notebook.prototype.getRangeSelectedNodes = function(range) {
		var nodes = [],
			start = range.startContainer,
			end = range.endContainer;
		if (start == end && "TR" != start.tagName) {
			if (start.hasChildNodes() && 0 !== start.children.length) {
				for (var child = start.children, i = range.startOffset; i < range.endOffset; i++) 
					child[i] && nodes.push(child[i]);
				return 0 === nodes.length && nodes.push(start), nodes
			}
			return [start]
		}
		if (start == end && "TR" == start.tagName) {
			var child = start.childNodes,
				j = range.startOffset;
			if (child.length > j && j >= 0) {
				var i = child[j];
				if ("TD" == i.tagName || "TH" == i.tagName) return [i]
			}
		}
		for (; start && start != end;) 
			nodes.push(start = this.nextNode(start, end));
		for (start = range.startContainer; start && start != range.commonAncestorContainer;) 
			nodes.unshift(start), start = start.parentNode;
		return nodes
	}, 
	jq.Notebook.prototype.getSelectedNodes = function() {
		if (window.getSelection) {
			var select = window.getSelection();
			if (!select.isCollapsed) {
				for (var ranges = this.getRanges(), d = [], i = 0; i < ranges.length; i++) 
					nodes = jq.merge(select, this.getRangeSelectedNodes(ranges[i]));
				return nodes
			}
			if (this.selectionInEditor()) {
				var container = select.getRangeAt(0).startContainer;
				return 3 == container.nodeType ? [container.parentNode] : [container]
			}
		}
		return []
	},
	jq.Notebook.prototype.getElementFromNode = function(node) {
		for (1 != node.nodeType && (node = node.parentNode); null !== node;) 
			node = node.parentNode;
		return null != node && "LI" == node.tagName && jq.makeArray(jq(node).parents()).indexOf(this.$element.get(0)) >= 0 ? node : null
	}, 
	jq.Notebook.prototype.getSelectionElements = function() {
		var nodes = this.getSelectedNodes(),
			elements = [];
		return jq.each(nodes, jq.proxy(function(i, node) {
			if (null !== node) {
				var ele = this.getElementFromNode(node);
				elements.indexOf(ele) < 0 && ele != this.$element.get(0) && null !== ele && elements.push(ele)
			}
		}, this)), 0 === elements.length && elements.push(this.$element.get(0)), elements
	},
	jq.Notebook.prototype.getSelectionElement = function() {
		var select = this.getSelection();
		if (select.rangeCount) {
			var range = this.getRange(),
				container = range.startContainer;
			1 != container.nodeType && (container = container.parentNode);
			var e = !1;
			container.children.length > 0 && container.children[range.startOffset] && jq(container.children[range.startOffset]).text() === this.text() && (container = container.children[range.startOffset], e = !0), 
			!e && container.children.length > 0 && jq(container.children[0]).text() === this.text() && ["BR", "IMG"].indexOf(container.children[0].tagName) < 0 && (container = container.children[0]);
			for (var f = container; f && "BODY" != f.tagName;) {
				if (f == this.$element.get(0)) return container;
				f = jq(f).parent()[0]
			}
		}
		return this.$element.get(0)
	}
}(jQuery)