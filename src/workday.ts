let isBlastin = false;
let currentUrl = location.href;

function replaceNames() {
    replaceNSIDNames(null);
    replaceListNames();
    replaceTableNames();
}

// NSID = Names (Student ID)
function replaceNSIDNames(node: Node | null) {
    if (!node) node = document.body;

    const children = node.childNodes;

    if (children.length === 0) {
        replaceNSIDName(node);
        return;
    }
    
    children.forEach(c => replaceNSIDNames(c));
}
function replaceNSIDName(node: Node) {
    const regex = /^(\S+\s+)+\(\d{8}\).*$/;
    if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue;
        if (value && regex.test(value)) {
            node.nodeValue = replaceName(value);
        }
    }
}

function replaceListNames() {
    const LIs = Array.from(document.getElementsByTagName("li"));
    LIs.forEach(l => scanLI(l));
}
function scanLI(element: HTMLElement) {
    const children = element.childNodes;
    if (children.length < 2) return;

    const firstChild = children[0]; // Assume first child is label
    const isName = checkChildHasName(firstChild);
    
    if (isName) children.forEach((c, index) => {
        if (index === 0) return;
        replaceNodeName(c);
    });
}
function checkChildHasName(node: Node): boolean {
    const children = Array.from(node.childNodes);
    if (children.length > 0) {
        return children.reduce(
            (acc, c) => {
                if (acc) return true;
                return acc || checkChildHasName(c);
            },
            false
        );
    }
    
    const value = node.nodeValue;
    if (value && node.nodeType === Node.TEXT_NODE) return textIncludesFlaggedWord(value);

    return false
}

function replaceTableNames() {
    const tables = Array.from(document.getElementsByTagName("table"));
    tables.forEach(t => scanTable(t))
}
function scanTable(table: HTMLTableElement) {
    const head = table.tHead;
    if (!head) return;
    const indices = scanHead(head);

    const bodies = Array.from(table.tBodies);
    bodies.forEach(b => scanBody(b, indices));
}
function scanHead(head: HTMLTableSectionElement): boolean[] {
    const isNameColumnArr: boolean[] = [];
    const rows = Array.from(head.rows);

    rows.forEach(r => scanHeadRow(r, isNameColumnArr));

    return isNameColumnArr;
}
function scanHeadRow(row: HTMLTableRowElement, isNameColumnArr: boolean[]) {
    const cells = Array.from(row.cells);
    cells.forEach(c => {
        const scope = c.getAttribute("scope");
        if (!scope || scope !== "col") return;

        isNameColumnArr.push(textIncludesFlaggedWord(c.innerText));
    });
}
function scanBody(body: HTMLTableSectionElement, isNameColumnArr: boolean[]) {
    const rows = Array.from(body.rows);
    rows.forEach(r => scanBodyRow(r, isNameColumnArr));
}
function scanBodyRow(row: HTMLTableRowElement, isNameColumnArr: boolean[]) {
    const cells = Array.from(row.cells);
    cells.forEach((cell, index) => {
        if (isNameColumnArr[index]) replaceNodeName(cell);
    });
}

function textIncludesFlaggedWord(text: string): boolean {
    const flaggedWords = ["Name", "Student", "Academic Record"];
    return flaggedWords.reduce(
        (acc, flaggedWord) => {
            if (acc) return true;
            return acc || text.includes(flaggedWord);
        },
        false
    );
}
function replaceNodeName(node: Node) {
    const children = node.childNodes;
    const value = node.nodeValue;

    if (children.length === 0 && value && node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = replaceName(value);
        return;
    }

    children.forEach(c => replaceNodeName(c));
}
function replaceName(text: string): string {
    const beforeStuID = text.split(/\d/)[0];
    const beforeColon = beforeStuID.split(":")[0];
    const censored = replaceAlphaCharsWithDashes(beforeColon);
    return text.replace(beforeColon, censored);
}
function replaceAlphaCharsWithDashes(source: string): string {
    return source.replace(/[a-zA-Z]+/g, "-----");
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