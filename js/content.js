chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
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
                $('input[type=hidden]*[id^="P"]').each(function() {
                    console.log($(this).attr("id") + ' : ' + $(this).val());
                });
                break;
        }
    });
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
    function(request, sender, sendResponse) {
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
    regionSel.each(function() {
        var regionLabel = $(this).siblings('span[role="treeitem"]').text();
        var regionObj = $(this).parent().parent();
        var itemSel = $(this).parent().siblings().find('[class^="a-Icon icon-item"]').siblings('span[role="treeitem"]')
        itemSel.each(function() {
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
document.addEventListener("mousedown", function(event) {
    if (event.button == 2) {
        clickedEl = event.target;
    }
}, true);
/*******************************************************************/
/************ -----==== End APEX Items ====----- *******************/
/*******************************************************************/