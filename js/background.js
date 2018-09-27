var Bookmarks = [];
addShortcutsInMenu();

chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason == "install") {
        chrome.storage.sync.set({
            'end_with_newline': true,
            'e4x': true,
            'comma_first': true,
            'preserve_newlines': true,
            'space_in_paren': false,
            'space_in_empty_paren': false,
            'keep_array_indentation': true,
            'break_chained_methods': false,
            'space_after_anon_function': false,
            'unescape_strings': true,
            'jslint_happy': true,
            'unindent_chained_methods': true,
            'indent_size': 4,
            'max_preserve_newlines': 1,
            'wrap_line_length': 0,
            'brace_style': "expand",
            'operator_position': "before-newline",
            'apex_colon_item': "true",
            'apex_ampersand_item': "true",
            'transform_uppercase': "true",
            'transform_lowercase': "true"
        }, function () {});
    }
});
chrome.commands.onCommand.addListener(function (command) {
    console.log('Command:', command);
    chrome.tabs.query({
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    }, function (ActiveTab) {
        var tab = ActiveTab[0];
        switch (command) {
            case "uppercase":
                toUppercase("", tab);
                break;
            case "lowercase":
                toLowercase("", tab);
                break;
            case 'hidden-items':
                ShowAllAPEXHiddenItems("", tab);
                break;
            case 'format-sql':
                FormatSQL("", tab);
                break;
            case 'beautify-js':
                BeautifyJS("", tab);
                break;
        }
    });
});

function toUppercase(info, tab) {
    chrome.tabs.sendMessage(tab.id, {
        "type": "onTransform",
        "transform": "uppercase"
    });
}

function toLowercase(info, tab) {
    chrome.tabs.sendMessage(tab.id, {
        "type": "onTransform",
        "transform": "lowercase"
    });
}

function ShowAllAPEXHiddenItems(info, tab) {
    chrome.tabs.sendMessage(tab.id, {
        "type": "onHiddenItems"
    });
}

function FormatSQL(info, tab) {
    chrome.tabs.sendMessage(tab.id, {
        "type": "onTransform",
        "transform": "format-sql"
    });
}

function BeautifyJS(info, tab) {
    chrome.tabs.sendMessage(tab.id, {
        "type": "onTransform",
        "transform": "beautify-js"
    });
}
/***************************************************************/
/************** -----==== Start Links ====----- ****************/
/***************************************************************/
function addShortcutsInMenu() {
    chrome.contextMenus.create({
        title: "Chrome Shortcuts",
        contexts: ["browser_action"],
        onclick: function (message) {
            chrome.tabs.create({
                url: "chrome://extensions/shortcuts"
            });
        }
    });
    chrome.contextMenus.create({
        id: "1000",
        title: "Links",
        contexts: ["browser_action"],
        onclick: function (message) {
            chrome.tabs.create({
                url: "http://apex.oracle.com/shortcuts"
            });
        }
    });
    addShortcuts();
}

function addShortcuts() {
    var ctr = 0;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            Bookmarks = JSON.parse(this.responseText);
            addShortcutsObj(Bookmarks);
        }
    };
    if (Object.keys(Bookmarks).length == 0) {
        xmlhttp.open("GET", "js/Links.json", true);
        xmlhttp.send();
    } else {
        addShortcutsObj(Bookmarks);
    }
}

function addShortcutsObj(Bookmarks) {
    Object.keys(Bookmarks).forEach(function (pShortCutName) {
        var urlLink = Bookmarks[pShortCutName]["url"];
        var entryType = Bookmarks[pShortCutName]["type"];

        chrome.contextMenus.create({
            parentId: "1000",
            title: pShortCutName,
            type: entryType,
            contexts: ["browser_action"],
            onclick: function (message) {
                chrome.tabs.create({
                    url: urlLink
                });
            }
        });
    });

}
/***************************************************************/
/************** -----==== End Links ====----- ******************/
/***************************************************************/

/***************************************************************/
/************ -----==== APEX Items ====----- *******************/
/***************************************************************/
var APEXItemEntries;

function insertMenuItemText(pMessage) {

    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            OperationMode: "insertMenuItemText",
            pMessage: pMessage
        });
    });

}

function arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length)
        return false;
    for (var i = arr1.length; i--;) {
        if (arr1[i] !== arr2[i])
            return false;
    }
    return true;
}

function APEXItemsContextMenu(pMenuItems) {
    if (APEXItemEntries != JSON.stringify(pMenuItems)) {
        chrome.contextMenus.removeAll();

        chrome.storage.sync.get(['transform_uppercase', 'transform_lowercase', 'apex_colon_item', 'apex_ampersand_item'], function (ContextMenu) {
            if (ContextMenu.transform_uppercase == "true") {
                chrome.contextMenus.create({
                    "title": "Uppercase",
                    "contexts": ["selection"],
                    "onclick": toUppercase
                });
            }
            if (ContextMenu.transform_lowercase == "true") {
                chrome.contextMenus.create({
                    "title": "Lowercase",
                    "contexts": ["selection"],
                    "onclick": toLowercase
                });
            }
            chrome.contextMenus.create({
                "title": "Show All APEX Hidden Items",
                "contexts": ["page"],
                "onclick": ShowAllAPEXHiddenItems
            });
            chrome.contextMenus.create({
                "title": "Format SQL",
                "contexts": ["selection"],
                "onclick": FormatSQL
            });
            chrome.contextMenus.create({
                "title": "Beautify JS",
                "contexts": ["selection"],
                "onclick": BeautifyJS
            });
            addShortcutsInMenu();
            for (var itemsArray = 0; itemsArray < pMenuItems.length; itemsArray++) {
                for (var itemNumber = 0; itemNumber < pMenuItems[itemsArray].length; itemNumber++) {
                    if (itemNumber == 0) {
                        if (itemsArray == 0) {
                            chrome.contextMenus.create({
                                title: "APEX Binds",
                                id: "0",
                                contexts: ['editable']
                            });
                            chrome.contextMenus.create({
                                title: "APEX Items",
                                id: "1",
                                contexts: ['editable']
                            });
                            chrome.contextMenus.create({
                                title: "APEX Report Items",
                                id: "2",
                                contexts: ['editable']
                            });
                        }
                        chrome.contextMenus.create({
                            type: "separator",
                            title: pMenuItems[itemsArray][itemNumber],
                            id: pMenuItems[itemsArray][itemNumber] + "_$$$1$" + 99 + itemsArray + "$" + itemNumber + "$",
                            parentId: "1",
                            contexts: ['editable']
                        });
                        if (pMenuItems[itemsArray][itemNumber] !== "^APEXBINDS^") {
                            if (pMenuItems[itemsArray].includes("^APEXITEM^") === true) {
                                chrome.contextMenus.create({
                                    title: pMenuItems[itemsArray][itemNumber],
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$2$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: "1",
                                    enabled: false,
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText(obj.menuItemId)
                                    }
                                });
                            }
                            if (pMenuItems[itemsArray].includes("^APEXREPORT^") === true) {
                                chrome.contextMenus.create({
                                    title: pMenuItems[itemsArray][itemNumber],
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$2$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: "2",
                                    enabled: false,
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText(obj.menuItemId)
                                    }
                                });
                            }
                        }
                    } else {
                        if (itemsArray == 0) {
                            chrome.contextMenus.create({
                                title: pMenuItems[itemsArray][itemNumber],
                                id: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                parentId: "0",
                                contexts: ['editable'],
                                onclick: function (obj) {
                                    insertMenuItemText(obj.menuItemId)
                                }
                            });
                        } else {
                            if (pMenuItems[itemsArray].includes("^APEXITEM^") === true && pMenuItems[itemsArray][itemNumber] !== "^APEXITEM^") {
                                chrome.contextMenus.create({
                                    title: pMenuItems[itemsArray][itemNumber],
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: "1",
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText(obj.menuItemId)
                                    }
                                });
                            } else if (pMenuItems[itemsArray].includes("^APEXREPORT^") === true && pMenuItems[itemsArray][itemNumber] !== "^APEXREPORT^") {
                                chrome.contextMenus.create({
                                    title: pMenuItems[itemsArray][itemNumber],
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: "2",
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText(obj.menuItemId)
                                    }
                                });
                            }
                        }
                        if (pMenuItems[itemsArray].includes("^APEXITEM^") === true && pMenuItems[itemsArray][itemNumber] !== "^APEXITEM^") {
                            if (ContextMenu.apex_colon_item == "true" || ContextMenu.apex_ampersand_item == "true") {
                                chrome.contextMenus.create({
                                    title: pMenuItems[itemsArray][itemNumber],
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$4$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText(obj.menuItemId)
                                    }
                                });
                            }
                            if (ContextMenu.apex_colon_item == "true") {
                                chrome.contextMenus.create({
                                    title: ":" + pMenuItems[itemsArray][itemNumber],
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$5$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText(":" + obj.menuItemId)
                                    }
                                });
                            }
                            if (ContextMenu.apex_ampersand_item == "true") {
                                chrome.contextMenus.create({
                                    title: "&&" + pMenuItems[itemsArray][itemNumber] + ".",
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$6$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText("&" + obj.menuItemId + ".")
                                    }
                                });
                            }
                        }
                        if (pMenuItems[itemsArray].includes("^APEXREPORT^") === true && pMenuItems[itemsArray][itemNumber] !== "^APEXREPORT^") {
                            if (ContextMenu.apex_colon_item == "true" || ContextMenu.apex_ampersand_item == "true") {
                                chrome.contextMenus.create({
                                    title: pMenuItems[itemsArray][itemNumber],
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$7$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText(obj.menuItemId)
                                    }
                                });
                            }
                            if (ContextMenu.apex_colon_item == "true") {
                                chrome.contextMenus.create({
                                    title: ":" + pMenuItems[itemsArray][itemNumber],
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$8$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText(":" + obj.menuItemId)
                                    }
                                });
                            }
                            chrome.contextMenus.create({
                                title: "#" + pMenuItems[itemsArray][itemNumber] + "#",
                                id: pMenuItems[itemsArray][itemNumber] + "_$$$9$" + itemsArray + "$" + itemNumber + "$",
                                parentId: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                contexts: ['editable'],
                                onclick: function (obj) {
                                    insertMenuItemText("#" + obj.menuItemId + "#")
                                }
                            });
                        }

                        if (pMenuItems[itemsArray].includes("^APEXBINDS^") === true && pMenuItems[itemsArray][itemNumber] !== "^APEXBINDS^") {
                            if (ContextMenu.apex_colon_item == "true" || ContextMenu.apex_ampersand_item == "true") {
                                chrome.contextMenus.create({
                                    title: pMenuItems[itemsArray][itemNumber],
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$4$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText(obj.menuItemId)
                                    }
                                });
                            }
                            if (ContextMenu.apex_colon_item == "true") {
                                chrome.contextMenus.create({
                                    title: ":" + pMenuItems[itemsArray][itemNumber],
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$5$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText(":" + obj.menuItemId)
                                    }
                                });
                            }
                            if (ContextMenu.apex_ampersand_item == "true") {
                                chrome.contextMenus.create({
                                    title: "&&" + pMenuItems[itemsArray][itemNumber] + ".",
                                    id: pMenuItems[itemsArray][itemNumber] + "_$$$6$" + itemsArray + "$" + itemNumber + "$",
                                    parentId: pMenuItems[itemsArray][itemNumber] + "_$$$3$" + itemsArray + "$" + itemNumber + "$",
                                    contexts: ['editable'],
                                    onclick: function (obj) {
                                        insertMenuItemText("&" + obj.menuItemId + ".")
                                    }
                                });
                            }
                        }
                    }
                }
            }
        });
    }
    APEXItemEntries = JSON.stringify(pMenuItems);
}
chrome.tabs.onActivated.addListener(function (message, sender, sendResponse) {
    APEXItemEntries = "0";
    APEXItemsContextMenu([])
});
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.pMode == "APEXItemsContextMenu" && sender.tab.active == true) {
        APEXItemsContextMenu(message.pMenuItems);
    }
});
var checkContectMenuExist = setInterval(function () {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        if (typeof tabs[0] !== "undefined") {
            chrome.tabs.sendMessage(tabs[0].id, {
                OperationMode: "sendAPEXItemsContextMenuArray"
            });
        }
    });
}, 500);

/***************************************************************/
/************ -----==== End APEX Items ====----- ***************/
/***************************************************************/