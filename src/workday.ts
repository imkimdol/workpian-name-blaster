let isBlastin = false;
let currentUrl = location.href;

function replaceNames() {
    replaceNSIDNames(null);
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
    if (!parent) return;

    const regex = /^(\S+\s+)+\(\d{8}\).*$/;
    if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue;
        if (value && regex.test(value)) {
            const beforeStuID = value.split(/\d/)[0];
            const censored = replaceAlphaCharsWithDashes(beforeStuID);
            node.nodeValue = value.replace(beforeStuID, censored);
        }
    }
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
    const row = head.rows[0]; // Assume one row for head
    const cells = Array.from(row.cells);

    cells.forEach(c => isNameColumnArr.push(checkHeadCellText(c)));

    return isNameColumnArr;
}
function checkHeadCellText(cell: HTMLTableCellElement) {
    return cell.innerText.includes("Name") || cell.innerText.includes("Student");
}
function scanBody(body: HTMLTableSectionElement, isNameColumnArr: boolean[]) {
    const rows = Array.from(body.rows);
    rows.forEach(r => scanBodyRow(r, isNameColumnArr));
}
function scanBodyRow(row: HTMLTableRowElement, isNameColumnArr: boolean[]) {
    const cells = Array.from(row.cells);

    cells.forEach((cell, index) => {
        if (isNameColumnArr[index]) {
            cell.innerText = replaceAlphaCharsWithDashes(cell.innerText);
        }
    });
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
        window.location.reload();
        sendResponse();
    } else if (message.action === 'isBlastin?') {
        sendResponse(isBlastin);
    }
});

setInterval(() => {if (isBlastin) replaceNames();}, 1000);