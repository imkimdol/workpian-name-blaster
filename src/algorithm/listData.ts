import type { Algorithm, AlgorithmInstantiatorFunction } from './algorithm';
import type { BiographicType, AlgorithmHelper } from './helper';
import type { ExtensionInfo } from "../extensionInfo";

class ListDataAlgorithm implements Algorithm {
    extensionInfo: ExtensionInfo;
    helper: AlgorithmHelper;

    constructor(extensionInfo: ExtensionInfo, algorithmHelper: AlgorithmHelper) {
        this.extensionInfo = extensionInfo;
        this.helper = algorithmHelper;
    }
    
    /**
     * Replaces WD elements manifesting as a list item with one div for the label and the other for the data to anonymize.
     */
    censorData(): void {
        if (this.extensionInfo.platform === "Appian") {
            this.replaceListDataAppian();
        } else {
            this.replaceListDataWorkday()
        }
    }
    private replaceListDataWorkday() {
        const LIs = Array.from(document.getElementsByTagName("li"));
        LIs.forEach(l => this.scanLI(l));
    }
    private replaceListDataAppian() {
        const Elements = Array.from(document.getElementsByClassName("SideBySideGroup---side_by_side"));
        Elements.forEach(l => this.scanLI(l));
    }

    /**
     * Scans each list item to see if it matches a WD label/data pairing with sensitive data.
     * @param element - the current HTML element
     * @returns automatically returns if the list item has less than 2 elements or does not have a label under the config file.
     */
    private scanLI(element: Element) {
        const children = element.childNodes;
        if (children.length < 2) return;

        const firstChild = children[0]; // Assume first child is label
        const bioType = this.checkLabelForFlaggedText(firstChild);
        
        if (bioType) children.forEach((c, index) => {
            if (index === 0) return;
            this.helper.replaceNodeText(c, bioType);
        });
    }

    /**
     * Recursive function that verifies for each (assumed) WD label node, that it is a label present in the config.json file.
     * @param node - the current HTML node (assume that it is a label)
     * @returns `bioType` - true if a match for the label was found in the config.json, false otherwise
     */
    private checkLabelForFlaggedText(node: Node): BiographicType {
        // checks the children of the LABEL's div class. One of them will be the label displayed, but we aren't always sure which one
        const children = Array.from(node.childNodes);
        if (children.length > 0) {
            for (const c of children) {
                const bioType = this.checkLabelForFlaggedText(c);
                if (bioType) return bioType;
            }
        }
        
        const value = node.nodeValue;
        if (value && node.nodeType === Node.TEXT_NODE) return this.helper.checkForFlaggedText(value);

        return 0;
    }
};

const getAlgorithm: AlgorithmInstantiatorFunction = (i, h) => {
    return new ListDataAlgorithm(i, h);
}
export default getAlgorithm;