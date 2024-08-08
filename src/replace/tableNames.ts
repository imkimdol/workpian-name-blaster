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
    const groupColumnPointers: number[] = [];
    const rows = Array.from(head.rows);

    rows.forEach(r => {
        const cells = Array.from(r.cells);
        cells.forEach(c => scanHeadRowCell(c, isBioInfoColumn, groupColumnPointers))
    });

    populateGroupColumnInfo(isBioInfoColumn, groupColumnPointers);
    
    return isBioInfoColumn;
}
function scanHeadRowCell(cell: HTMLTableCellElement, isBioInfoColumn: BiographicType[], groupColumnPointers: number[]) {
    const scope = cell.getAttribute("scope");
    if (!scope) {
        const className = cell.className;
        if (className === "PagingGridLayout---checkbox") {
            console.log(className);
            isBioInfoColumn.push(checkForFlaggedText(cell.innerText));
        }
        return;
    };

    if (scope !== "col") {
        /*
            ──────▄▀▄─────▄▀▄
            ─────▄█░░▀▀▀▀▀░░█▄
            ─▄▄──█░░░░░░░░░░░█──▄▄
            █▄▄█─█░░▀░░┬░░▀░░█─█▄▄█
        */
        
        const spanString = cell.getAttribute("colSpan");
        if (!spanString) return;
        const span = parseInt(spanString);

        for (let i=0; i<span; i++) {
            isBioInfoColumn.push(0);
            groupColumnPointers.push(isBioInfoColumn.length-1);
        }
        return;
    }

    isBioInfoColumn.push(checkForFlaggedText(cell.innerText));
}
function populateGroupColumnInfo(isBioInfoColumn: BiographicType[], groupColumnPointers: number[]) {
    for (let i=0; i<groupColumnPointers.length; i++) {
        const pointer = groupColumnPointers[i];
        const sourceIndex = isBioInfoColumn.length - groupColumnPointers.length + i;
        isBioInfoColumn[pointer] = isBioInfoColumn[sourceIndex];
    }
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