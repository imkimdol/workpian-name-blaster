let currentUrl = location.href;

function replaceNames() {
    const allElements = document.getElementsByTagName('*');

    const regex = /^\w+\s\w+\s\(\d{8}\)$/;
    for (e of allElements) {
        const content = e.innerText;
        if (regex.test(content)) {
            e.innerText = content.replace(/[a-zA-Z]+/g, "xxxxx");
        }
    }
}

function waitForJSLoadThenReplaceNames() {
    setTimeout(replaceNames, 2000);
}

function checkForURLChanges() {
    setInterval(() => {
        if (location.href !== currentUrl) {
            currentUrl = location.href;
            waitForJSLoadThenReplaceNames();
        }
    }, 500);
}

waitForJSLoadThenReplaceNames();
checkForURLChanges();