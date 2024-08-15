import type { Algorithm, AlgorithmInstantiatorFunction } from './algorithm';
import type { DataType, AlgorithmHelper } from './helper';
import type { ExtensionInfo } from "../extensionInfo";

/**
 * An algorithm used for censoring data in list form.
 */
abstract class ListDataAlgorithm implements Algorithm {
    extensionInfo: ExtensionInfo;
    helper: AlgorithmHelper;

    constructor(extensionInfo: ExtensionInfo, algorithmHelper: AlgorithmHelper) {
        this.extensionInfo = extensionInfo;
        this.helper = algorithmHelper;
    }
    
    censorData() {
        this.scanListItems();
    }

    /**
     * Retrieves list items from DOM and censors sensitive data.
     */
    protected abstract scanListItems(): void;

    /**
     * Scans list item for and censors sensitive data. 
     * 
     * @param element Current element
     */
    protected scanListItem(element: Element) {
        const children = element.childNodes;
        if (children.length < 2) return;

        const label = children[0]; // Assume first child is label
        const bioType = this.checkLabelForFlaggedText(label);
        
        if (bioType) children.forEach((c, index) => {
            if (index === 0) return;
            this.helper.censorNodeText(c, bioType);
        });
    }

    /**
     * Recursive function that verifies for each (assumed) WD label node, that it is a label present in the config.json file.
     * @param node Current HTML node (assume that it is a label)
     * @returns `true` if a match for the label was found in the config.json, `false` otherwise
     */
    private checkLabelForFlaggedText(node: Node): DataType {
        // checks the children of the LABEL's div class. One of them will be the label displayed, but we aren't always sure which one
        const children = Array.from(node.childNodes);
        if (children.length > 0) {
            for (const c of children) {
                const bioType = this.checkLabelForFlaggedText(c);
                if (bioType) return bioType;
            }
        }
        
        const value = node.nodeValue;
        if (node.nodeType === Node.TEXT_NODE && value) return this.helper.checkLabelForFlaggedText(value);

        return 0;
    }
};
class ListDataAlgorithmWorkday extends ListDataAlgorithm {
    scanListItems(): void {
        const listItems = Array.from(document.getElementsByTagName("li"));
        listItems.forEach(i => this.scanListItem(i));
    };
};
class ListDataAlgorithmAppian extends ListDataAlgorithm {
    scanListItems(): void {
        const Elements = Array.from(document.getElementsByClassName("SideBySideGroup---side_by_side"));
        Elements.forEach(e => this.scanListItem(e));
    };
};

/**
 * Creates an instance of `ListDataAlgorithm` that matches the current platform.
 * @returns Instantiated class.
 */
const getAlgorithm: AlgorithmInstantiatorFunction = (i, h) => {
    if (i.platform === "Workday") {
        return new ListDataAlgorithmWorkday(i, h);
    } else {
        return new ListDataAlgorithmAppian(i, h);
    }
};
export default getAlgorithm;