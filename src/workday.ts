let config;
let replaceFunctions: VoidFunction[] = [];

let isBlastin = false;

async function importFiles() {
    const configParser = await import(chrome.runtime.getURL("configParser.js"));
    config = configParser.config;

    if (config.enableListReplacement) {
        const listNamesUrl = chrome.runtime.getURL("replace/listNames.js");
        const replaceListNames = (await import(listNamesUrl)).default;
        if (replaceListNames) replaceFunctions.push(replaceListNames);
    }
    if (config.enableTableReplacement) {
        const tableNamesUrl = chrome.runtime.getURL("replace/tableNames.js");
        const replaceTableNames = (await import(tableNamesUrl)).default;
        if (replaceTableNames) replaceFunctions.push(replaceTableNames);
    }
    if (config.enableNSIDReplacement) {
        const nsidNamesUrl = chrome.runtime.getURL("replace/nsidNames.js");
        const replaceNSIDNames = (await import(nsidNamesUrl)).default;
        if (replaceNSIDNames) replaceFunctions.push(replaceNSIDNames);
    }
}

async function replaceNames() {
    if (replaceFunctions.length === 0) await importFiles();
    replaceFunctions.forEach(f => f());
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