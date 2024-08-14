import type { Algorithm, AlgorithmInstantiatorFunction } from './algorithm';
import type { BiographicType, AlgorithmHelper } from './helper';
import type { ExtensionInfo } from "../extensionInfo";

class TableNamesAlgorithm implements Algorithm {
    extensionInfo: ExtensionInfo;
    helper: AlgorithmHelper;

    constructor(extensionInfo: ExtensionInfo, algorithmHelper: AlgorithmHelper) {
        this.extensionInfo = extensionInfo;
        this.helper = algorithmHelper;
    };

    censorData(): void {
        const tables = Array.from(document.getElementsByTagName("table"));
        tables.forEach(t => this.scanTable(t));
    };

    private scanTable(table: HTMLTableElement) {
        const head = table.tHead;
        if (!head) return;
        const indices = this.scanHead(head);
    
        const bodies = Array.from(table.tBodies);
        bodies.forEach(b => this.scanBody(b, indices));
    };
    private scanHead(head: HTMLTableSectionElement): BiographicType[] {
        const isBioInfoColumn: BiographicType[] = [];
        const groupColumnPointers: number[] = [];
        const rows = Array.from(head.rows);
    
        rows.forEach(r => {
            const cells = Array.from(r.cells);
            cells.forEach(c => this.scanHeadRowCell(c, isBioInfoColumn, groupColumnPointers))
        });
    
        this.populateGroupColumnInfo(isBioInfoColumn, groupColumnPointers);
        
        return isBioInfoColumn;
    };
    private scanHeadRowCell(cell: HTMLTableCellElement, isBioInfoColumn: BiographicType[], groupColumnPointers: number[]) {
        const scope = cell.getAttribute("scope");
        if (!scope) {
            const className = cell.className;
            if (className === "PagingGridLayout---checkbox") {
                isBioInfoColumn.push(this.helper.checkForFlaggedText(cell.innerText));
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
    
        isBioInfoColumn.push(this.helper.checkForFlaggedText(cell.innerText));
    };
    private populateGroupColumnInfo(isBioInfoColumn: BiographicType[], groupColumnPointers: number[]) {
        for (let i=0; i<groupColumnPointers.length; i++) {
            const pointer = groupColumnPointers[i];
            const sourceIndex = isBioInfoColumn.length - groupColumnPointers.length + i;
            isBioInfoColumn[pointer] = isBioInfoColumn[sourceIndex];
        }
    };
    
    private scanBody(body: HTMLTableSectionElement, isBioInfoColumn: BiographicType[]) {
        const rows = Array.from(body.rows);
        rows.forEach(r => this.scanBodyRow(r, isBioInfoColumn));
    };
    private scanBodyRow(row: HTMLTableRowElement, isBioInfoColumn: BiographicType[]) {
        const cells = Array.from(row.cells);
        cells.forEach((cell, index) => {
            if (isBioInfoColumn[index]) this.helper.replaceNodeText(cell, isBioInfoColumn[index]);
        });
    };
};

const getAlgorithm: AlgorithmInstantiatorFunction = (i, h) => {
    return new TableNamesAlgorithm(i, h);
}
export default getAlgorithm;