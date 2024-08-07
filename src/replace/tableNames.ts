const helpersUrl = chrome.runtime.getURL("replace/helpers.js");
const { textIncludesFlaggedWord, replaceNodeName } = await import(helpersUrl);

export default function replaceTableNames() {
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