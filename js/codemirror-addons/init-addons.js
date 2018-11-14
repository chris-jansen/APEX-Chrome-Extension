var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
};

function escapeHtml(string) {
    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}

function successMessage(codeMirror) {
    let codeMirrorWrapper = codeMirror.getWrapperElement();
    $(codeMirrorWrapper).parents("div.a-CodeEditor").find("div.a-CodeEditor-message").html('<ul><li class="is-success">Validation successful</li></ul>');
    $(codeMirrorWrapper).parents("div.a-CodeEditor").find(".a-CodeEditor-notification").show();
}

$("body")
    .on("dialogopen", function (dialog) {
        setTimeout(function () {
            if ($(dialog.target).attr("id") == "editorDlg") {
                let codeMirrorToolBar = $(dialog.target).find(".a-CodeEditor-toolbar");
                let codeMirrorField = $(dialog.target).find(".CodeMirror")[0].CodeMirror;
                let typeCode = codeMirrorField.getMode().name;
                let typeTextField = codeMirrorField.getOption("mode");
                if (typeCode == "javascript" || typeCode == "css" || typeCode == "htmlmixed" || typeCode == "sql" || typeTextField === "text/text") {
                    if (typeCode === "javascript" || typeCode === "css" || typeCode == "htmlmixed" || typeTextField === "text/text") {
                        codeMirrorToolBar.find("button#editorDlg-codeEditor_autocomplete").after('<button id="editorDlg-codeEditor_validate" title="Validate - Ctrl+Alt+V" aria-label="Validate - Ctrl+Alt+V" class="a-Button a-Button--noLabel a-Button--withIcon" type="button"><span class="a-Icon icon-cm-validate" aria-hidden="true"></span></button>');
                    }
                    codeMirrorToolBar.find("button#editorDlg-codeEditor_validate").after('<button id="editorDlg-codeEditor_beautify" title="Beautify Code - Ctrl+Alt+B" aria-label="Beautify Code - Ctrl+Alt+B" class="a-Button a-Button--noLabel a-Button--withIcon" type="button"><span class="a-Icon icon-sc-ui" aria-hidden="true"></span></button>');
                    if (typeCode === "sql") {
                        let Button = $("button#editorDlg-codeEditor_validate").attr("title");
                        Button = Button + " - Ctrl+Alt+V";
                        $("button#editorDlg-codeEditor_validate").attr("title", Button);
                        $("button#editorDlg-codeEditor_validate").attr("aria-label", Button);
                    }
                    let ShortCuts = {
                        "Ctrl-Alt-B": function () {
                            $("button#editorDlg-codeEditor_beautify").click()
                        },
                        "Ctrl-Alt-V": function () {
                            $("button#editorDlg-codeEditor_validate").click()
                        }
                    };
                    let extraKeys = codeMirrorField.getOption("extraKeys");
                    let ExtendKeys = $.extend(extraKeys, ShortCuts);
                    codeMirrorField.setOption("extraKeys", ExtendKeys)
                }
            }
        }, 50)

        $("body").on("click", "button#editorDlg-codeEditor_beautify", function () {
            let codeMirrorField = $(this).parents("div.a-CodeEditor").find(".CodeMirror")[0].CodeMirror;
            let codeMirrorValue = codeMirrorField.getValue();
            let typeCode = codeMirrorField.getMode().name;
            let typeTextField = codeMirrorField.getOption("mode");
            let codeMirrorIndent = codeMirrorField.getOption("indentUnit") || 4;
            let beautifiedCode;
            if (typeCode == "javascript" || typeCode == "css" || typeCode == "htmlmixed" || typeCode === "sql" || typeTextField === "text/text") {
                if (typeCode === "javascript") {
                    beautifiedCode = window.js_beautify(codeMirrorValue, {
                        indent_size: codeMirrorIndent
                    });
                } else if (typeCode === "css") {
                    beautifiedCode = window.css_beautify(codeMirrorValue, {
                        indent_size: codeMirrorIndent
                    })
                } else if (typeCode === "htmlmixed" || typeTextField === "text/text") {
                    beautifiedCode = window.html_beautify(codeMirrorValue, {
                        indent_size: codeMirrorIndent
                    })
                } else if (typeCode === "sql") {
                    let Indent = ' ';
                    Indent = Indent.repeat(codeMirrorIndent);

                    beautifiedCode = window.sqlFormatter.format(codeMirrorValue, {
                        language: "pl/sql",
                        indent: Indent
                    });
                }
                codeMirrorField.setValue(beautifiedCode);
            }
        });
        $("body").on("click", "button#editorDlg-codeEditor_validate", function () {
            let codeMirrorField = $(this).parents("div.a-CodeEditor").find(".CodeMirror")[0].CodeMirror;
            let typeCode = codeMirrorField.getMode().name;
            let typeTextField = codeMirrorField.getOption("mode");
            if (typeCode === "javascript" || typeCode === "css" || typeCode == "htmlmixed" || typeTextField === "text/text") {
                codeMirrorLint(codeMirrorField)
            }
        });
    });

    const codeEditorModeHTML = `
    <li class="a-Menu-item">
    <div class="a-Menu-inner"><span class="a-Menu-labelContainer"><span class="a-Menu-statusCol"></span>
        <button type="button" class="a-Menu-label" aria-haspopup="true" aria-expanded="false">Codemirror Mode</button>
        </span><span class="a-Menu-accelContainer"><span class="a-Menu-subMenuCol"><span class="a-Icon icon-menu-sub"></span></span>
        </span>
    </div>
        <div class="a-Menu" role="menu" tabindex="-1" style="position: absolute; top: 241px; left: -71px; display: none;">
            <div class="a-Menu-content">
                <ul>
                    <li class="S4SAP-menu-item btn-code-editor-mode" data-code-editor-mode="text/css">
                        <div class="a-Menu-inner"><span class="a-Menu-labelContainer"><span class="a-Menu-statusCol"><span class="a-Icon"></span></span>
                            <button type="button" role="menuitemradio" class="a-Menu-label">CSS</button>
                            </span><span class="a-Menu-accelContainer"><span class="a-Menu-subMenuCol"></span></span>
                        </div>
                    </li>
                    <li class="S4SAP-menu-item btn-code-editor-mode" data-code-editor-mode="text/javascript">
                        <div class="a-Menu-inner"><span class="a-Menu-labelContainer"><span class="a-Menu-statusCol"><span class="a-Icon"></span></span>
                            <button type="button" role="menuitemradio" class="a-Menu-label">JS</button>
                            </span><span class="a-Menu-accelContainer"><span class="a-Menu-subMenuCol"></span></span>
                        </div>
                    </li>
                    <li class="S4SAP-menu-item btn-code-editor-mode" data-code-editor-mode="text/html">
                        <div class="a-Menu-inner"><span class="a-Menu-labelContainer"><span class="a-Menu-statusCol"><span class="a-Icon"></span></span>
                            <button type="button" role="menuitemradio" class="a-Menu-label">HTML</button>
                            </span><span class="a-Menu-accelContainer"><span class="a-Menu-subMenuCol"></span></span>
                        </div>
                    </li>
                    <li class="S4SAP-menu-item btn-code-editor-mode" data-code-editor-mode="text/x-plsql">
                        <div class="a-Menu-inner"><span class="a-Menu-labelContainer"><span class="a-Menu-statusCol"><span class="a-Icon"></span></span>
                            <button type="button" role="menuitemradio" class="a-Menu-label">PL/SQL</button>
                            </span><span class="a-Menu-accelContainer"><span class="a-Menu-subMenuCol"></span></span>
                        </div>
                    </li>
                    <li class="S4SAP-menu-item btn-code-editor-mode" data-code-editor-mode="text/text">
                    <div class="a-Menu-inner"><span class="a-Menu-labelContainer"><span class="a-Menu-statusCol"><span class="a-Icon"></span></span>
                        <button type="button" role="menuitemradio" class="a-Menu-label">TEXT</button>
                        </span><span class="a-Menu-accelContainer"><span class="a-Menu-subMenuCol"></span></span>
                    </div>
                </li>
                </ul>
            </div>
        </div>
    </li>`;

    $("body").on("click", "button#editorDlg-codeEditor_settings", function () {
        $("#editorDlg-codeEditor_settingsMenu div ul li:last").after(codeEditorModeHTML);
        let codeMirrorField = $(this).parents("div.a-CodeEditor").find(".CodeMirror")[0].CodeMirror;
        let typeTextField = codeMirrorField.getOption("mode")
        $('[data-code-editor-mode="'+typeTextField+'"]').find('.a-Menu-statusCol .a-Icon').addClass('icon-menu-radio');
    });

    $("body").on("click",".btn-code-editor-mode", function () {
        let modeToSet = $(this).data("code-editor-mode");
        let codeMirrorField = $(".CodeMirror")[0].CodeMirror;
        codeMirrorField.setOption("mode", modeToSet);
        $('.btn-code-editor-mode').find('.a-Menu-statusCol .a-Icon').removeClass('icon-menu-radio');
        $(this).find('.a-Menu-statusCol .a-Icon').addClass('icon-menu-radio');
    });


function codeMirrorLint(codeMirrorField) {
    let line = [];
    let typeCode = codeMirrorField.getMode().name;
    let typeTextField = codeMirrorField.getOption("mode")
    let codeMirrorWrapper = codeMirrorField.getWrapperElement();
    $(codeMirrorWrapper).parents("div.a-CodeEditor").find(".is-error").remove();
    $(codeMirrorWrapper).parents("div.a-CodeEditor").find(".a-CodeEditor-notification").hide();
    codeMirrorField.setValue(codeMirrorField.getValue());

    codeMirrorField.operation(function () {
        for (let i = 0; i < line.length; ++i) {
            codeMirrorField.removeLineWidget(line[i])
        }
        line.length = 0;
        if (typeCode == "javascript") {
            let jshintRules = {
                "esnext": true
            };

            let jsHintValue = JSHINT(codeMirrorField.getValue(), jshintRules);
            if (jsHintValue) {
                successMessage(codeMirrorField);
            } else {
                for (let i = 0; i < JSHINT.errors.length; ++i) {
                    let message = JSHINT.errors[i];
                    if (!message) {
                        continue
                    }
                    let messageDiv = document.createElement("div");

                    messageDiv.innerHTML = "Error: Line " + message.line + ":" + escapeHtml(message.reason);
                    messageDiv.className = "is-error";

                    line.push(codeMirrorField.addLineWidget(message.line - 1, messageDiv, {
                        coverGutter: true,
                        noHScroll: true
                    }));
                }
            }
        } else if (typeCode == "css") {
            let codeMirrorCSSLint = CSSLint.verify(codeMirrorField.getValue());
            if (codeMirrorCSSLint.messages.length === 0) {
                successMessage(codeMirrorField);
            } else {
                for (let i = 0; i < codeMirrorCSSLint.messages.length; ++i) {
                    let message = codeMirrorCSSLint.messages[i];
                    if (!message) {
                        continue;
                    }

                    let messageDiv = document.createElement("div");

                    if (codeMirrorCSSLint.messages[i].type === 'warning') {
                        messageDiv.innerHTML = "Warning: Line " + message.line + ": " + escapeHtml(message.message);
                        messageDiv.className = "is-warning";
                    } else if (codeMirrorCSSLint.messages[i].type === 'error') {
                        messageDiv.innerHTML = "Error: Line " + message.line + ": " + escapeHtml(message.message);
                        messageDiv.className = "is-error";
                    }

                    line.push(codeMirrorField.addLineWidget(message.line - 1, messageDiv, {
                        coverGutter: true,
                        noHScroll: true
                    }));
                }
            }
        } else if (typeTextField == "text/text") {
            let htmlHintRules = {
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

            let codeMirrorHTMLhint = HTMLHint.verify(codeMirrorField.getValue(), htmlHintRules);
            if (codeMirrorHTMLhint.length === 0) {
                successMessage(codeMirrorField);
            } else {
                for (let i = 0; i < codeMirrorHTMLhint.length; ++i) {
                    let message = codeMirrorHTMLhint[i];
                    if (!message) {
                        continue;
                    }
                    let messageDiv = document.createElement("div");

                    if (message.type === 'warning') {
                        messageDiv.innerHTML = "Warning: Line " + message.line + ": " + escapeHtml(message.message);
                        messageDiv.className = "is-warning";
                    } else if (message.type === 'error') {
                        messageDiv.innerHTML = "Error: Line " + message.line + ": " + escapeHtml(message.message);
                        messageDiv.className = "is-error";
                    }

                    line.push(codeMirrorField.addLineWidget(message.line - 1, messageDiv, {
                        coverGutter: true,
                        noHScroll: true
                    }));
                }
            }
        }
    });
}