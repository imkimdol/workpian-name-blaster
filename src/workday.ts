let isBlastin = false;
let currentUrl = location.href;

function replaceNames() {
    const allElements = document.getElementsByTagName('*');

    const regex = /^\w+\s\w+\s\(\d{8}\)$/;
    for (const e of Array.from(allElements) as Array<HTMLElement>) {
        const content = e.innerText;
        if (regex.test(content)) {
            e.innerText = content.replace(/[a-zA-Z]+/g, "xxxxx");
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
        replaceNames()
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