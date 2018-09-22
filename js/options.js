$(document).ready(function () {
	var BeautifyArrayItems = [];

	// Since the js_beautify options need true/false and not the string "true"
	function toggle_true_false(toggle_item) {
		if (toggle_item === "true") {
			return true
		} else {
			return false
		}
	}

	function set_jsbeautify_values() {
		//checkboxes col-1
		BeautifyArrayItems['end_with_newline'] = toggle_true_false($('#end_with_newline').val());
		BeautifyArrayItems['e4x'] = toggle_true_false($('#e4x').val());
		BeautifyArrayItems['comma_first'] = toggle_true_false($('#comma_first').val());
		BeautifyArrayItems['preserve_newlines'] = toggle_true_false($('#preserve_newlines').val());
		BeautifyArrayItems['space_in_paren'] = toggle_true_false($('#space_in_paren').val());
		BeautifyArrayItems['space_in_empty_paren'] = toggle_true_false($('#space_in_empty_paren').val());
		//checkboxes col-2
		BeautifyArrayItems['keep_array_indentation'] = toggle_true_false($('#keep_array_indentation').val());
		BeautifyArrayItems['break_chained_methods'] = toggle_true_false($('#break_chained_methods').val());
		BeautifyArrayItems['space_after_anon_function'] = toggle_true_false($('#space_after_anon_function').val());
		BeautifyArrayItems['unescape_strings'] = toggle_true_false($('#unescape_strings').val());
		BeautifyArrayItems['jslint_happy'] = toggle_true_false($('#jslint_happy').val());
		BeautifyArrayItems['unindent_chained_methods'] = toggle_true_false($('#unindent_chained_methods').val());
		// Select List col-3
		BeautifyArrayItems['indent_size'] = $('#indent_size').val();
		BeautifyArrayItems['max_preserve_newlines'] = $('#max_preserve_newlines').val();
		BeautifyArrayItems['wrap_line_length'] = $('#wrap_line_length').val();
		BeautifyArrayItems['brace_style'] = $('#brace_style').val();
		BeautifyArrayItems['operator_position'] = $('#operator_position').val();

		chrome.storage.sync.set({
			'end_with_newline': BeautifyArrayItems['end_with_newline'],
			'e4x': BeautifyArrayItems['e4x'],
			'comma_first': BeautifyArrayItems['comma_first'],
			'preserve_newlines': BeautifyArrayItems['preserve_newlines'],
			'space_in_paren': BeautifyArrayItems['space_in_paren'],
			'space_in_empty_paren': BeautifyArrayItems['space_in_empty_paren'],
			'keep_array_indentation': BeautifyArrayItems['keep_array_indentation'],
			'break_chained_methods': BeautifyArrayItems['break_chained_methods'],
			'space_after_anon_function': BeautifyArrayItems['space_after_anon_function'],
			'unescape_strings': BeautifyArrayItems['unescape_strings'],
			'jslint_happy': BeautifyArrayItems['jslint_happy'],
			'unindent_chained_methods': BeautifyArrayItems['unindent_chained_methods'],
			'indent_size': BeautifyArrayItems['indent_size'],
			'max_preserve_newlines': BeautifyArrayItems['max_preserve_newlines'],
			'wrap_line_length': BeautifyArrayItems['wrap_line_length'],
			'brace_style': BeautifyArrayItems['brace_style'],
			'operator_position': BeautifyArrayItems['operator_position']
		}, function () {});
	}
	chrome.storage.sync.get(['end_with_newline', 'e4x', 'comma_first', 'preserve_newlines', 'space_in_paren', 'space_in_empty_paren', 'keep_array_indentation', 'break_chained_methods', 'space_after_anon_function', 'unescape_strings', 'jslint_happy', 'unindent_chained_methods', 'indent_size', 'max_preserve_newlines', 'wrap_line_length', 'brace_style', 'operator_position'], function (BeautifierJS) {
		$('#end_with_newline').val(BeautifierJS.end_with_newline);
		$('#e4x').val(BeautifierJS.e4x);
		$('#comma_first').val(BeautifierJS.comma_first);
		$('#preserve_newlines').val(BeautifierJS.preserve_newlines);
		$('#space_in_paren').val(BeautifierJS.space_in_paren);
		$('#space_in_empty_paren').val(BeautifierJS.space_in_empty_paren);
		$('#keep_array_indentation').val(BeautifierJS.keep_array_indentation);
		$('#break_chained_methods').val(BeautifierJS.break_chained_methods);
		$('#space_after_anon_function').val(BeautifierJS.space_after_anon_function);
		$('#unescape_strings').val(BeautifierJS.unescape_strings);
		$('#jslint_happy').val(BeautifierJS.jslint_happy);
		$('#unindent_chained_methods').val(BeautifierJS.unindent_chained_methods);
		$('#indent_size').val(BeautifierJS.indent_size);
		$('#max_preserve_newlines').val(BeautifierJS.max_preserve_newlines);
		$('#wrap_line_length').val(BeautifierJS.wrap_line_length);
		$('#brace_style').val(BeautifierJS.brace_style);
		$('#operator_position').val(BeautifierJS.operator_position);

		$(".md-toggle[value='true']").prop("checked", true);
		$(".md-toggle[value='false']").prop("checked", false);
	});

	$("#save").click(function () {
		set_jsbeautify_values();
		showtoast('JS Beautifier Values saved!');
	});

	$("#test-jsbeautify-settings").click(function () {
		set_jsbeautify_values();
		var textarea_jsbeautify = $('#textarea-jsbeautify').val();
		var jsbeautify_options = js_beautify(textarea_jsbeautify, {
			"end_with_newline": BeautifyArrayItems['end_with_newline'],
			"e4x": BeautifyArrayItems['e4x'],
			"comma_first": BeautifyArrayItems['comma_first'],
			"preserve_newlines": BeautifyArrayItems['preserve_newlines'],

			"space_in_paren": BeautifyArrayItems['space_in_paren'],
			"space_in_empty_paren": BeautifyArrayItems['space_in_empty_paren'],

			"keep_array_indentation": BeautifyArrayItems['keep_array_indentation'],
			"break_chained_methods": BeautifyArrayItems['break_chained_methods'],
			"space_after_anon_function": BeautifyArrayItems['space_after_anon_function'],
			"unescape_strings": BeautifyArrayItems['unescape_strings'],
			"jslint_happy": BeautifyArrayItems['jslint_happy'],
			"unindent_chained_methods": BeautifyArrayItems['unindent_chained_methods'],

			"indent_size": BeautifyArrayItems['indent_size'],
			"max_preserve_newlines": BeautifyArrayItems['max_preserve_newlines'],
			"wrap_line_length": BeautifyArrayItems['wrap_line_length'],
			"brace_style": BeautifyArrayItems['brace_style'],
			"operator_position": BeautifyArrayItems['operator_position'],

			"indent_char": " ",
			"indent_level": 0,
			"eol": "\n",
			"indent_with_tabs": false
		});
		$('#textarea-jsbeautify').val(jsbeautify_options);
		showtoast('Output of JS Beautifier Settings Shown inside textarea.');
	});

	$(".md-toggle").on('change', function () {
		if ($(this).is(':checked')) {
			$(this).attr('value', 'true');
		} else {
			$(this).attr('value', 'false');
		}
	});

	var clickedTab = $(".tabs > .active");
	var tabWrapper = $(".tab__content");
	var activeTab = tabWrapper.find(".active");
	var activeTabHeight = activeTab.outerHeight();
	activeTab.show();
	tabWrapper.height(activeTabHeight);
	$(".tabs > li").on("click", function () {
		$(".tabs > li").removeClass("active");
		$(this).addClass("active");
		clickedTab = $(".tabs .active");
		activeTab.fadeOut(50, function () {
			$(".tab__content > li").removeClass("active");
			var clickedTabIndex = clickedTab.index();
			$(".tab__content > li").eq(clickedTabIndex).addClass("active");
			activeTab = $(".tab__content > .active");
			activeTabHeight = activeTab.outerHeight();
			tabWrapper.stop().delay(10).animate({
				height: activeTabHeight
			}, 50, function () {
				activeTab.delay(10).fadeIn(50);

			});
		});
	});
});


function ToastBuilder(options) {
	var opts = options;
	return function (text) {
		$('<div/>')
			.addClass('toast')
			.prependTo($(opts.target))
			.text(text || opts.defaultText)
			.queue(function (next) {
				$(this).css({
					'opacity': 1
				});
				var topOffset = 15;
				$('.toast').each(function () {
					var $this = $(this);
					var height = $this.outerHeight();
					var offset = 15;
					$this.css('top', topOffset + 'px');

					topOffset += height + offset;
				});
				next();
			})
			.delay(opts.displayTime)
			.queue(function (next) {
				var $this = $(this);
				var width = $this.outerWidth() + 20;
				$this.css({
					'right': '-' + width + 'px',
					'opacity': 0
				});
				next();
			})
			.delay(600)
			.queue(function (next) {
				$(this).remove();
				next();
			});
	};
}

var toastOptions = {
	displayTime: 5000,
	target: 'body'
};
var showtoast = new ToastBuilder(toastOptions);