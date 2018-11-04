$("body")
.on("dialogopen", function (dialog) {
    setTimeout(function () {
        if ($(dialog.target).attr("id") == "editorDlg") {
            var CodeMirrorToolBar = $(dialog.target).find(".a-CodeEditor-toolbar");
            var CodeMirrorFields = $(dialog.target).find(".CodeMirror")[0].CodeMirror;
            var TypeCode = CodeMirrorFields.getMode().name;
            var ReadOnly = CodeMirrorFields.getOption("readOnly");
            if (TypeCode && (TypeCode == "javascript" || TypeCode == "css" || TypeCode == "htmlmixed") && !(ReadOnly)) {
                CodeMirrorToolBar.find("button#editorDlg-codeEditor_autocomplete").after('<button id="editorDlg-codeEditor-beautify" title="Beautify Code - Ctrl+Alt+B" aria-label="Beautify Code - Ctrl+Alt+B" class="a-Button a-Button--noLabel a-Button--withIcon" type="button"><span class="a-Icon icon-quick-pick" aria-hidden="true"></span></button>');
                if (TypeCode == "javascript" || TypeCode == "css") {
                    CodeMirrorToolBar.find("button#editorDlg-codeEditor-beautify").after('<button id="editorDlg-codeEditor-validate" title="Validate ' + TypeCode.toLowerCase() + ' - Ctrl+Alt+V" aria-label="Validate ' + TypeCode.toLowerCase() + ' - Ctrl+Alt+V" class="a-Button a-Button--noLabel a-Button--withIcon" type="button"><span class="a-Icon icon-cm-validate" aria-hidden="true"></span></button>')
                }
                var ShortCuts = {
                    "Ctrl-Alt-B": function() {
                        $("button#editorDlg-codeEditor-beautify").click()
                    }
                    , "Ctrl-Alt-V": function() {
                        $("button#editorDlg-codeEditor-validate").click()
                    }
                };
                var extraKeys = CodeMirrorFields.getOption("extraKeys");
                var ExtendKeys = $.extend(extraKeys, ShortCuts);
                CodeMirrorFields.setOption("extraKeys", ExtendKeys)
            } else {
                if (TypeCode && TypeCode == "sql" && !(ReadOnly)) {
                    var Button = $("button#editorDlg-codeEditor-validate").attr("title");
                    Button = Button + " - Ctrl+Alt+V";
                    $("button#editorDlg-codeEditor-validate").attr("title", Button);
                    $("button#editorDlg-codeEditor-validate").attr("aria-label", Button);
                    var ShortCuts = {
                        "Ctrl-Alt-V": function() {
                            $("button#editorDlg-codeEditor-validate").click()
                        }
                    };
                    var extraKeys = CodeMirrorFields.getOption("extraKeys");
                    var ExtendKeys = $.extend(extraKeys, ShortCuts);
                    CodeMirrorFields.setOption("extraKeys", ExtendKeys)
                }
            }
        }
    }, 50)

    $("body").on("click", "button#editorDlg-codeEditor-beautify", function () {
        var CodeMirrorField = $(this).parents("div.a-CodeEditor").find(".CodeMirror")[0].CodeMirror;
        var CodeMirrorValue = CodeMirrorField.getValue();
        var TypeCode = CodeMirrorField.getMode().name;
        var CodeMirrorIndent = CodeMirrorField.getOption("indentUnit") || 4;
        var BeautifiedCode;
        if (TypeCode && (TypeCode == "javascript" || TypeCode == "css" || TypeCode == "htmlmixed")) {
            if (TypeCode == "javascript") {
                BeautifiedCode = window.js_beautify(CodeMirrorValue, {
                    indent_size: CodeMirrorIndent
                });                    
            } else {
                if (TypeCode == "css") {
                    BeautifiedCode = window.css_beautify(CodeMirrorValue, {
                        indent_size: CodeMirrorIndent
                    })
                } else {
                    if (TypeCode == "htmlmixed") {
                        BeautifiedCode = window.html_beautify(CodeMirrorValue, {
                            indent_size: CodeMirrorIndent
                        })
                    }
                }
            }
            CodeMirrorField.setValue(BeautifiedCode)
        }
    });
    $("body").on("click", "button#editorDlg-codeEditor-validate", function () {
        var CodeMirrorField = $(this).parents("div.a-CodeEditor").find(".CodeMirror")[0].CodeMirror;
        var TypeCode = CodeMirrorField.getMode().name;
        if (TypeCode && (TypeCode == "javascript" || TypeCode == "css")) {
            JSHintCodeMirror(CodeMirrorField)
        }
    });
});

function JSHintCodeMirror(CodeMirrorField) {
    var line = [];
    var CodeMirrorWrapper = CodeMirrorField.getWrapperElement();
    var TypeCode = CodeMirrorField.getMode().name;
    $(CodeMirrorWrapper).parents("div.a-CodeEditor").find(".is-error").remove();
    $(CodeMirrorWrapper).parents("div.a-CodeEditor").find(".a-CodeEditor-notification").hide();
    CodeMirrorField.setValue(CodeMirrorField.getValue());
    CodeMirrorField.operation(function () {
        for (var i = 0; i < line.length; ++i) {
            CodeMirrorField.removeLineWidget(line[i])
        }
        line.length = 0;
        if (TypeCode == "javascript") {
            var JSHintValue = JSHINT(CodeMirrorField.getValue());
            if (JSHintValue) {
                $(CodeMirrorWrapper)
                    .parents("div.a-CodeEditor").find("div.a-CodeEditor-message").html('<ul><li class="is-success">Validation successful</li></ul>');
                $(CodeMirrorWrapper)
                    .parents("div.a-CodeEditor").find(".a-CodeEditor-notification").show()
            } else {
                for (var i = 0; i < JSHINT.errors.length; ++i) {
                    var Errors = JSHINT.errors[i];
                    if (!Errors) {
                        continue
                    }
                    var ErorrDiv = document.createElement("div");
                    var ErrorSpan = ErorrDiv.appendChild(document.createElement("span"));
                    ErrorSpan.innerHTML = "Line " + Errors.line + ":";
                    ErrorSpan.className = "is-error";
                    ErorrDiv.appendChild(document.createTextNode(Errors.reason));
                    ErorrDiv.className = "is-error";
                    line.push(CodeMirrorField.addLineWidget(Errors.line - 1, ErorrDiv, {
                        coverGutter: false
                        , noHScroll: true
                    }))
                }
            }
        } else {
            if (TypeCode == "css") {
                var CodeMirrorCSSLint = CSSLint.verify(CodeMirrorField.getValue());
                if (CodeMirrorCSSLint && CodeMirrorCSSLint.messages.length == 0) {
                    $(CodeMirrorWrapper)
                        .parents("div.a-CodeEditor")
                        .find("div.a-CodeEditor-message")
                        .html('<ul><li class="is-success">Validation successful</li></ul>');
                    $(CodeMirrorWrapper)
                        .parents("div.a-CodeEditor")
                        .find(".a-CodeEditor-notification")
                        .show()
                } else {
                    for (var i = 0; i < CodeMirrorCSSLint.messages.length; ++i) {
                        var Errors = CodeMirrorCSSLint.messages[i];
                        if (!Errors) {
                            continue
                        }
                        var ErorrDiv = document.createElement("div");
                        var ErrorSpan = ErorrDiv.appendChild(document.createElement("span"));
                        ErrorSpan.innerHTML = "Line " + Errors.line + ":";
                        ErrorSpan.className = "is-error";
                        ErorrDiv.appendChild(document.createTextNode(Errors.message));
                        ErorrDiv.className = "is-error";
                        line.push(CodeMirrorField.addLineWidget(Errors.line - 1, ErorrDiv, {
                            coverGutter: false
                          , noHScroll: true
                        }))
                    }
                }
            }
        }
    });
    var ScrollInfo = CodeMirrorField.getScrollInfo();
    var Coords = CodeMirrorField.charCoords({
            line: CodeMirrorField.getCursor().line + 1 , ch: 0 }, "local").top;
    if (ScrollInfo.top + ScrollInfo.clientHeight < Coords) {
        CodeMirrorField.scrollTo(null, Coords - ScrollInfo.clientHeight + 3)
    }
}