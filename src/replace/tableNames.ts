import type { BiographicType } from './helpers';

const helpers = await import(chrome.runtime.getURL("replace/helpers.js"));
const checkForFlaggedText: (text: string) => BiographicType = helpers.checkForFlaggedText;
const replaceNodeText: (node: Node, bioType: BiographicType) => void = helpers.replaceNodeText;

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
function scanHead(head: HTMLTableSectionElement): BiographicType[] {
    const isBioInfoColumn: BiographicType[] = [];
    const rows = Array.from(head.rows);

    rows.forEach(r => scanHeadRow(r, isBioInfoColumn));

    return isBioInfoColumn;
}
function scanHeadRow(row: HTMLTableRowElement, isBioInfoColumn: BiographicType[]) {
    const cells = Array.from(row.cells);
    cells.forEach(c => {
        const scope = c.getAttribute("scope");
        if (!scope || scope !== "col") return;

        isBioInfoColumn.push(checkForFlaggedText(c.innerText));
    });
}
function scanBody(body: HTMLTableSectionElement, isBioInfoColumn: BiographicType[]) {
    const rows = Array.from(body.rows);
    rows.forEach(r => scanBodyRow(r, isBioInfoColumn));
}
function scanBodyRow(row: HTMLTableRowElement, isBioInfoColumn: BiographicType[]) {
    const cells = Array.from(row.cells);
    cells.forEach((cell, index) => {
        if (isBioInfoColumn[index]) replaceNodeText(cell, isBioInfoColumn[index]);
    });
}