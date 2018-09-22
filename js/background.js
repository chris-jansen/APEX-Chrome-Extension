var Bookmarks = [];
addShortcutsInMenu();

chrome.commands.onCommand.addListener(function(command) {
    console.log('Command:', command);
    chrome.tabs.query({
        active: true,
        windowId: chrome.windows.WINDOW_ID_CURRENT
    }, function(ActiveTab) {
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
/***************************************************************/
/************** -----==== Start Links ====----- ****************/
/***************************************************************/
function addShortcutsInMenu() {	
	    chrome.contextMenus.create({
        title: "Chrome Shortcuts",
        contexts: ["browser_action"],
        onclick: function(message) {
            chrome.tabs.create({
                url: "chrome://extensions/shortcuts"
            });
        }
    });
    chrome.contextMenus.create({
        id: "1000",
        title: "Links",
        contexts: ["browser_action"],
        onclick: function(message) {
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
    xmlhttp.onreadystatechange = function() {
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
    Object.keys(Bookmarks).forEach(function(pShortCutName) {
        var urlLink = Bookmarks[pShortCutName]["url"];
        var entryType = Bookmarks[pShortCutName]["type"];

        chrome.contextMenus.create({
            parentId: "1000",
            title: pShortCutName,
            type: entryType,
            contexts: ["browser_action"],
            onclick: function(message) {
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
    }, function(tabs) {
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
		chrome.contextMenus.create({
		"title": "Uppercase",
		"contexts": ["selection"],
		"onclick": toUppercase
		});
		chrome.contextMenus.create({
			"title": "Lowercase",
			"contexts": ["selection"],
			"onclick": toLowercase
		});
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
		addShortcutsInMenu();
        for (var i = 0; i < pMenuItems.length; i++) {
            for (var x = 0; x < pMenuItems[i].length; x++) {
                if (x == 0) {
                    if (i == 0) {
                        chrome.contextMenus.create({
                            title: pMenuItems[i][x],
                            id: "0",
                            enabled: false,
                            contexts: ['editable']
                        });
                    } else {
                        chrome.contextMenus.create({
                            type: "separator",
                            title: pMenuItems[i][x],
                            id: pMenuItems[i][x] + "_$$$1$" + 99 + "$" + x + "$",
                            contexts: ['editable']
                        });
                        chrome.contextMenus.create({
                            title: pMenuItems[i][x],
                            id: pMenuItems[i][x] + "_$$$2$" + i + "$" + x + "$",
                            enabled: false,
                            contexts: ['editable'],
                            onclick: function(obj) {
                                insertMenuItemText(obj.menuItemId)
                            }
                        });
                    }
                } else {
                    chrome.contextMenus.create({
                        title: pMenuItems[i][x],
                        id: pMenuItems[i][x] + "_$$$4$" + i + "$" + x + "$",
                        contexts: ['editable'],
                        onclick: function(obj) {
                            insertMenuItemText(obj.menuItemId)
                        }
                    });
                }
            }
        }
    }
    APEXItemEntries = JSON.stringify(pMenuItems);
}
chrome.tabs.onActivated.addListener(function(message, sender, sendResponse) {
    APEXItemEntries = "0";
    APEXItemsContextMenu([])
});
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.pMode == "APEXItemsContextMenu" && sender.tab.active == true) {
        APEXItemsContextMenu(message.pMenuItems);
    }
});
var checkContectMenuExist = setInterval(function() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
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