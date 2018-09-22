var BeautifyArrayItems = [];

chrome.storage.sync.get(['end_with_newline', 'e4x', 'comma_first', 'preserve_newlines', 'space_in_paren', 'space_in_empty_paren', 'keep_array_indentation', 'break_chained_methods', 'space_after_anon_function', 'unescape_strings', 'jslint_happy', 'unindent_chained_methods', 'indent_size', 'max_preserve_newlines', 'wrap_line_length', 'brace_style', 'operator_position'], function (BeautifierJS) {
    BeautifyArrayItems['end_with_newline'] = BeautifierJS.end_with_newline;
    BeautifyArrayItems['e4x'] = BeautifierJS.e4x;
    BeautifyArrayItems['comma_first'] = BeautifierJS.comma_first;
    BeautifyArrayItems['preserve_newlines'] = BeautifierJS.preserve_newlines;
    BeautifyArrayItems['space_in_paren'] = BeautifierJS.space_in_paren;
    BeautifyArrayItems['space_in_empty_paren'] = BeautifierJS.space_in_empty_paren;
    BeautifyArrayItems['keep_array_indentation'] = BeautifierJS.keep_array_indentation;
    BeautifyArrayItems['break_chained_methods'] = BeautifierJS.break_chained_methods;
    BeautifyArrayItems['space_after_anon_function'] = BeautifierJS.space_after_anon_function;
    BeautifyArrayItems['unescape_strings'] = BeautifierJS.unescape_strings;
    BeautifyArrayItems['jslint_happy'] = BeautifierJS.jslint_happy;
    BeautifyArrayItems['unindent_chained_methods'] = BeautifierJS.unindent_chained_methods;
    BeautifyArrayItems['indent_size'] = BeautifierJS.indent_size;
    BeautifyArrayItems['max_preserve_newlines'] = BeautifierJS.max_preserve_newlines;
    BeautifyArrayItems['wrap_line_length'] = BeautifierJS.wrap_line_length;
    BeautifyArrayItems['brace_style'] = BeautifierJS.brace_style;
    BeautifyArrayItems['operator_position'] = BeautifierJS.operator_position;
});

chrome.extension.onMessage.addListener(
    function (request, sender, sendResponse) {
        switch (request.type) {
            case "onTransform":
                var strSelection = getSelectionText();
                if (strSelection !== '-') {
                    var strReplace = replaceText(request.transform, strSelection);
                    document.execCommand("insertText", false, strReplace);
                } else {
                    console.log('Selection to big.');
                }
                break;
            case "onHiddenItems":
                $('input[type=hidden]*[id^="P"]').each(function () {
                    console.log($(this).attr("id") + ' : ' + $(this).val());
                });
                break;
        }
    });

function beautifyJSText(text) {
    var beautifiedJS = "";
    beautifiedJS = js_beautify(text, {
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
    return beautifiedJS;
};

function replaceText(transform, text) {
    switch (transform) {
        case "uppercase":
            var ret = text.toUpperCase();
            return ret;
            break;
        case "lowercase":
            var ret = text.toLowerCase();
            return ret;
            break;
        case "format-sql":
            var ret = window.sqlFormatter.format(text);
            return ret;
            break;
        case "beautify-js":
            var ret = beautifyJSText(text);
            console.log('beautifyJSText' + beautifyJSText(text));
            return ret;
            break;
        default:
            return text;
            break;
    }
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}
/*********************************************************************/
/************ -----==== Start APEX Items ====----- *******************/
/*********************************************************************/
var clickedEl = null;
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.OperationMode == "insertMenuItemText") {
            insertAtCursor(clickedEl, request.pMessage);
        }
        if (request.OperationMode == "sendAPEXItemsContextMenuArray") {
            sendAPEXItemsContextMenuArray();
        }
    });

function injectJS(CustomJSCode) {
    var script = document.createElement('script');
    script.id = 'tmpScript';
    var code = document.createTextNode('(function() {' + CustomJSCode + '})();');
    script.appendChild(code);
    (document.body || document.head).appendChild(script);
    $("#tmpScript").remove();
}

function insertAtCursor(myField, myValue) {
    myValue = myValue.replace(/_\$\$\$[0-9]+\$[0-9]+\$[0-9]+\$/g, "");
    if (clickedEl.closest('.CodeMirror')) {
        var CustomJSCode = `
	            var editor = $('.CodeMirror')[0].CodeMirror;
				editor.getDoc().replaceSelection("` + myValue + `");
				`;
        injectJS(CustomJSCode);
    } else {
        if (document.selection) {
            myField.focus();
            sel = document.selection.createRange();
            sel.text = myValue;
        } else if (myField.selectionStart || myField.selectionStart == '0') {
            var startPos = myField.selectionStart;
            var endPos = myField.selectionEnd;
            myField.value = myField.value.substring(0, startPos) +
                myValue +
                myField.value.substring(endPos, myField.value.length);
        } else {
            myField.value += myValue;
        }
        var replaceValue = myField.value.replace(/`/g, '\\`');
        var CustomJSCode = 'apex.item("' + myField.id + '").setValue(`' + replaceValue + '`);';
        injectJS(CustomJSCode);
    }
}

function sendAPEXItemsContextMenuArray() {
    var RegionLabel = false;
    var Itemslist = [];
    var APEXItems = [];
    var regionSel = $("#renderTree_container").find('[class^="a-Icon icon-region"]');
    regionSel.each(function () {
        var regionLabel = $(this).siblings('span[role="treeitem"]').text();
        var regionObj = $(this).parent().parent();
        var itemSel = $(this).parent().siblings().find('[class^="a-Icon icon-item"]').siblings('span[role="treeitem"]')
        itemSel.each(function () {
            if ($(this).parentsUntil(regionObj).length <= 5) {
                APEXItems.push($(this).text().replace(" [Global Page]", ""));
            }
        });
        if (APEXItems.length != 0) {
            APEXItems.splice(0, 0, regionLabel);
            Itemslist.push(APEXItems);
        }
        APEXItems = [];
    });
    chrome.runtime.sendMessage({
        pMode: "APEXItemsContextMenu",
        pMenuItems: Itemslist
    });
}
document.addEventListener("mousedown", function (event) {
    if (event.button == 2) {
        clickedEl = event.target;
    }
}, true);
/*******************************************************************/
/************ -----==== End APEX Items ====----- *******************/
/*******************************************************************/