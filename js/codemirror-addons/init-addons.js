var entityMap = {'&': '&amp;'
                ,'<': '&lt;'
                ,'>': '&gt;'
                ,'"': '&quot;'
                ,"'": '&#39;'
                ,'/': '&#x2F;'
                ,'`': '&#x60;'
                ,'=': '&#x3D;'
};
  
function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}

$("body")
.on("dialogopen", function (dialog) {
    setTimeout(function () {
        if ($(dialog.target).attr("id") == "editorDlg") {
            var CodeMirrorToolBar = $(dialog.target).find(".a-CodeEditor-toolbar");
            var CodeMirrorField = $(dialog.target).find(".CodeMirror")[0].CodeMirror;
            var TypeCode = CodeMirrorField.getMode().name;
            var TypeTextField = CodeMirrorField.getOption("mode");
            var ReadOnly = CodeMirrorField.getOption("readOnly");
            if (TypeCode == "javascript" || TypeCode == "css" || TypeCode == "htmlmixed" || TypeTextField === "text/text") {
                if (TypeCode === "javascript" || TypeCode === "css" || TypeTextField === "text/text") {
                    CodeMirrorToolBar.find("button#editorDlg-codeEditor_autocomplete ").after('<button id="editorDlg-codeEditor-validate" title="Validate - Ctrl+Alt+V" aria-label="Validate - Ctrl+Alt+V" class="a-Button a-Button--noLabel a-Button--withIcon" type="button"><span class="a-Icon icon-cm-validate" aria-hidden="true"></span></button>')
                }
                CodeMirrorToolBar.find("button#editorDlg-codeEditor-validate").after('<button id="editorDlg-codeEditor-beautify" title="Beautify Code - Ctrl+Alt+B" aria-label="Beautify Code - Ctrl+Alt+B" class="a-Button a-Button--noLabel a-Button--withIcon" type="button"><span class="a-Icon fa fa-paint-brush" aria-hidden="true"></span></button>');
                var ShortCuts = {
                    "Ctrl-Alt-B": function() {
                        $("button#editorDlg-codeEditor-beautify").click()
                    }
                    , "Ctrl-Alt-V": function() {
                        $("button#editorDlg-codeEditor-validate").click()
                    }
                };
                var extraKeys = CodeMirrorField.getOption("extraKeys");
                var ExtendKeys = $.extend(extraKeys, ShortCuts);
                CodeMirrorField.setOption("extraKeys", ExtendKeys)
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
                    var extraKeys = CodeMirrorField.getOption("extraKeys");
                    var ExtendKeys = $.extend(extraKeys, ShortCuts);
                    CodeMirrorField.setOption("extraKeys", ExtendKeys)
                }
            }
        }
    }, 50)

    $("body").on("click", "button#editorDlg-codeEditor-beautify", function () {
        var CodeMirrorField = $(this).parents("div.a-CodeEditor").find(".CodeMirror")[0].CodeMirror;
        var CodeMirrorValue = CodeMirrorField.getValue();
        var TypeCode = CodeMirrorField.getMode().name;
        var TypeTextField = CodeMirrorField.getOption("mode");
        var CodeMirrorIndent = CodeMirrorField.getOption("indentUnit") || 4;
        var BeautifiedCode;
        if (TypeCode == "javascript" || TypeCode == "css" || TypeCode == "htmlmixed" || TypeTextField === "text/text") {
            if (TypeCode === "javascript") {
                BeautifiedCode = window.js_beautify(CodeMirrorValue, {
                    indent_size: CodeMirrorIndent
                });                    
            } else if (TypeCode === "css") {
                BeautifiedCode = window.css_beautify(CodeMirrorValue, {
                    indent_size: CodeMirrorIndent
                })
            } else if (TypeCode === "htmlmixed" || TypeTextField === "text/text") {
                BeautifiedCode = window.html_beautify(CodeMirrorValue, {
                        indent_size: CodeMirrorIndent
                    })
            }
        }
        CodeMirrorField.setValue(BeautifiedCode)
    });
    $("body").on("click", "button#editorDlg-codeEditor-validate", function () {
        var CodeMirrorField = $(this).parents("div.a-CodeEditor").find(".CodeMirror")[0].CodeMirror;
        var TypeCode = CodeMirrorField.getMode().name;
        var TypeTextField = CodeMirrorField.getOption("mode");
        if (TypeCode === "javascript" || TypeCode === "css" || TypeTextField === "text/text") {
            codeMirrorLint(CodeMirrorField)
        }
    });
});

function codeMirrorLint(CodeMirrorField) {
    var line = [];
    var CodeMirrorWrapper = CodeMirrorField.getWrapperElement();
    var TypeCode = CodeMirrorField.getMode().name;
    var TypeTextField = CodeMirrorField.getOption("mode")
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
               $(CodeMirrorWrapper).parents("div.a-CodeEditor").find("div.a-CodeEditor-message").html('<ul><li class="is-success">Validation successful</li></ul>');
               $(CodeMirrorWrapper).parents("div.a-CodeEditor").find(".a-CodeEditor-notification").show();
            } else {               
                for (var i = 0; i < JSHINT.errors.length; ++i) {
                    var message = JSHINT.errors[i];
                    if (!message) {
                        continue
                    }
                    var messageDiv = document.createElement("div");
                    
                    messageDiv.innerHTML = "Error: Line " + message.line + ":" + escapeHtml(message.reason);
                    messageDiv.className = "is-error";

                    line.push(CodeMirrorField.addLineWidget(message.line - 1, messageDiv, {
                          coverGutter: true
                        , noHScroll: true
                    }));
                }
            }
        } else if(TypeCode == "css"){
            var codeMirrorCSSLint = CSSLint.verify(CodeMirrorField.getValue());
            if (codeMirrorCSSLint.messages.length === 0) {
                $(CodeMirrorWrapper).parents("div.a-CodeEditor").find("div.a-CodeEditor-message").html('<ul><li class="is-success">Validation successful</li></ul>');
                $(CodeMirrorWrapper).parents("div.a-CodeEditor").find(".a-CodeEditor-notification").show();
            } else {
                console.log(codeMirrorCSSLint.messages);
                for (var i = 0; i < codeMirrorCSSLint.messages.length; ++i) {
                    var message = codeMirrorCSSLint.messages[i];
                    if (!message) {
                        continue;
                    }
                    
                    var messageDiv = document.createElement("div");

                    if(codeMirrorCSSLint.messages[i].type === 'warning'){
                        messageDiv.innerHTML = "Warning: Line " + message.line + ": " + escapeHtml(message.message);
                        messageDiv.className = "is-warning";
                    }else if(codeMirrorCSSLint.messages[i].type === 'error'){
                        messageDiv.innerHTML = "Error: Line " + message.line + ": " + escapeHtml(message.message);
                        messageDiv.className = "is-error";
                    }

                    line.push(CodeMirrorField.addLineWidget(message.line - 1, messageDiv, {
                        coverGutter: true
                        , noHScroll: true
                    }));
                }
            }
        }else if(TypeTextField == "text/text"){
            var htmlHintRules = {
                "tagname-lowercase": true,
                "attr-lowercase": true,
                "attr-value-double-quotes": true,
                "tag-pair": true,
                "spec-char-escape": true,
                "id-unique": true,
                "src-not-empty": true,
                "attr-no-duplication": true,
                "title-require": true,
                "attr-value-not-empty": true,
                "tag-self-close": true,
                "id-class-value": "dash"
              };

            var CodeMirrorHTMLhint = HTMLHint.verify(CodeMirrorField.getValue(), htmlHintRules);
            if (CodeMirrorHTMLhint.length === 0) {
                $(CodeMirrorWrapper).parents("div.a-CodeEditor").find("div.a-CodeEditor-message").html('<ul><li class="is-success">Validation successful</li></ul>');
                $(CodeMirrorWrapper).parents("div.a-CodeEditor").find(".a-CodeEditor-notification").show();
            } else {
                for (var i = 0; i < CodeMirrorHTMLhint.length; ++i) {
                    var message = CodeMirrorHTMLhint[i];
                    if (!message) {
                        continue;
                    }
                    console.log(CodeMirrorHTMLhint[i]);
                    var messageDiv = document.createElement("div");
                    
                    if(message.type === 'warning'){
                        messageDiv.innerHTML = "Warning: Line " + message.line + ": " + escapeHtml(message.message);
                        messageDiv.className = "is-warning";
                    }else if(message.type === 'error'){
                        messageDiv.innerHTML = "Error: Line " + message.line + ": " + escapeHtml(message.message);
                        messageDiv.className = "is-error";
                    }

                    line.push(CodeMirrorField.addLineWidget(message.line - 1, messageDiv, {
                        coverGutter: true
                      , noHScroll: true
                    }));
                }
            }
        }
    });
}