import type { ExtensionInfo } from "../extensionInfo";
/**
 * - `NonBiographic`: Not censored.
 * 
 * - `Name`: Alpha characters are censored.
 * 
 * - `Other`: All chraracter are censored.
 */
export enum DataType {NonBiographic, Name, Other};

/**
 * An abstraction that holds all common functions used by algorithm classes.
 */
export class AlgorithmHelper {
    private extensionInfo: ExtensionInfo;

    constructor(extensionInfo: ExtensionInfo) {
        this.extensionInfo = extensionInfo;
    }

    /**
     * Checks if the provided label matches any of user-provided data type flags.
     * @param label Label to check
     * @returns `DataType` of the string, if a match is found
     */
    checkLabelForFlaggedText(label: string): DataType {
        for (const regex of this.extensionInfo.flaggedNameLabels) {
            if (regex.test(label)) return DataType.Name;
        }
        for (const regex of this.extensionInfo.flaggedOtherLabels) {
            if (regex.test(label)) return DataType.Other;
        }
        return DataType.NonBiographic;
    };

    /**
     * Recursive function that traverses all nodes in a node tree.
     * If the current node is a leaf, censor the node according to the `DataType`.
     * 
     * This function assumes that all children of the current node has the same `DataType`.
     * 
     * @param node Current node in traversal
     * @param dataType Type of current node
     */
    censorNodeText(node: Node, dataType: DataType) {
        const children = node.childNodes;
        const value = node.nodeValue;

        if (children.length === 0 && value && node.nodeType === Node.TEXT_NODE) {
            if (dataType === DataType.Name) {
                node.nodeValue = this.censorData(value);
            } else {
                node.nodeValue = this.replaceTextWithDashes(value);
            }
            return;
        }

        children.forEach(c => this.censorNodeText(c, dataType));
    }

    /**
     * Censors data according to the user-provided configuration.
     * - `scanUsingNumericPivot`: if true, strings will be split by any number in the string
     * - `splitBeforeNumericPivot`: if `scanUsingNumericPivot` is true, this determines which half of the string to keep at the number. Before if true, after if false
     * - `scanUsingColonPivot`: if true, strings will be split by any colon (:) in the string
     * - `splitBeforeColonPivot`: if `scanUsingColonPivot` is true, this determines which half of the string to use. Before if true, after if false.
     * 
     * @param text String to be censored
     * @returns Censored string
     */
    censorData(text: string): string {
        let beforeText = text;
        
        if (this.extensionInfo.scanUsingNumericPivot) {
            const split = beforeText.split(/\d/);
            if (this.extensionInfo.splitBeforeNumericPivot) beforeText = split[0];
            else if (beforeText.length > 1) beforeText = split[split.length - 1];
        }

        if (this.extensionInfo.scanUsingColonPivot) {
            const split = beforeText.split(":");
            if (this.extensionInfo.splitBeforeColonPivot) beforeText = split[0];       
            else if (beforeText.length > 1) beforeText = split[split.length - 1];
        }

        const censored = this.replaceAlphaCharsWithDashes(beforeText);
        return text.replace(beforeText, censored);
    }

    /**
     * Replaces all characters in the provided string with dashes.
     * @param source String to be replaced
     * @returns String with replacements
     */
    private replaceTextWithDashes(source: string): string {
        return source.replace(/.+/, "-----");
    }

    /**
     * Replaces all alphabet characters in the provided string with dashes.
     * @param source String to be replaced
     * @returns String with replacements
     */
    private replaceAlphaCharsWithDashes(source: string): string {
        return source.replace(/[a-zA-Z\-]+/g, "-----");
    }
};