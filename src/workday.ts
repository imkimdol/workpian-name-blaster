let isBlastin = false;
let currentUrl = location.href;

function replaceNames(node: Node | null) {
    if (!node) node = document.body;

    const children = node.childNodes;

    if (children.length === 0) {
        replaceName(node);
        return;
    }
    
    children.forEach(c => replaceNames(c));
}

function replaceName(node: Node) {
    if (!parent) return;

    const regex = /^\w+\s\w+\s\(\d{8}\)$/;
    if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue;
        if (value && regex.test(value)) {
            node.nodeValue = value.replace(/[a-zA-Z]+/g, "xxxxx");
        }
    }
}

function waitForJSLoadThenReplaceNames() {
    setTimeout(replaceNames, 500);
}

function checkForURLChanges() {
    setInterval(() => {
        if (isBlastin && location.href !== currentUrl) {
            currentUrl = location.href;
            waitForJSLoadThenReplaceNames();
        }
    }, 250);
}

checkForURLChanges();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startBlastin') {
        replaceNames(null)
        isBlastin = true
        sendResponse();
    } else if (message.action === 'stopBlastin') {
        isBlastin = false
        window.location.reload();
        sendResponse();
    } else if (message.action === 'isBlastin?') {
        sendResponse(isBlastin);
    }
});