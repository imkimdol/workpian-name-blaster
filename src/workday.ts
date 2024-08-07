let isBlastin = false;
let replaceListNames: () => void;
let replaceTableNames: () => void;
let replaceNSIDNames: (node: Node | null) => void;

// https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension
async function importFiles() {
    const listNamesUrl = chrome.runtime.getURL("replace/listNames.js");
    const tableNamesUrl = chrome.runtime.getURL("replace/tableNames.js");
    const nsidNamesUrl = chrome.runtime.getURL("replace/nsidNames.js");
    replaceListNames = (await import(listNamesUrl)).default;
    replaceTableNames = (await import(tableNamesUrl)).default;
    replaceNSIDNames = (await import(nsidNamesUrl)).default;
}

async function replaceNames() {
    if (!replaceListNames || !replaceTableNames || !replaceNSIDNames) await importFiles();
    
    replaceListNames();
    replaceTableNames();
    replaceNSIDNames(null);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startBlastin') {
        replaceNames()
        isBlastin = true
        sendResponse();
    } else if (message.action === 'stopBlastin') {
        isBlastin = false
        sendResponse();
    } else if (message.action === 'isBlastin?') {
        sendResponse(isBlastin);
    }
});

setInterval(() => {if (isBlastin) replaceNames();}, 2000);