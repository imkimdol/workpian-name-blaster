import type { Algorithm, AlgorithmInstantiatorFunction } from './algorithm';
import type { AlgorithmHelper } from './helper';
import type { ExtensionInfo } from "../extensionInfo";

/**
 * An algorithm used for censoring data that matches a certain template.
 * (e.g. "`John Doe (12345678)`" or "`87654321 | Jane Doe`")
 * 
 * Uses node traversal on the entire DOM to find HTML elements that match the template.
 */
abstract class SimpleTemplateDataAlgorithm implements Algorithm {
    extensionInfo: ExtensionInfo;
    helper: AlgorithmHelper;

    constructor(extensionInfo: ExtensionInfo, algorithmHelper: AlgorithmHelper) {
        this.extensionInfo = extensionInfo;
        this.helper = algorithmHelper;
    };

    censorData(): void {
        this.traverseNode();
    };

    /**
     * Recursive function traverses all children in a node.
     * @param node The current node. If `null`, the document body is taken.
     */
    traverseNode(node: null | Node = null): void {
        if (!node) node = document.body;

        const children = node.childNodes;

        if (children.length === 0) {
            this.checkLeafNode(node);
            return;
        }
    
        children.forEach(c => this.traverseNode(c));
    }
    /**
     * Checks the given leaf node's value. If the value matches the template, censors it.
     * @param node The leaf node.
     */
    abstract checkLeafNode(node: Node): void
};
class SimpleTemplateDataAlgorithmWorkday extends SimpleTemplateDataAlgorithm {
    checkLeafNode(node: Node): void {
        const value = node.nodeValue;
        if (node.nodeType !== Node.TEXT_NODE || !value) return;

        const regexWD = /^([\S\-]+\s+)+\(\d{8}\).*$/;
            if (value && regexWD.test(value)) {
                node.nodeValue = this.helper.censorData(value);
        };
    };
};
class SimpleTemplateDataAlgorithmAppian extends SimpleTemplateDataAlgorithm {
    checkLeafNode(node: Node): void {
        const value = node.nodeValue;
        if (node.nodeType !== Node.TEXT_NODE || !value) return;

        const regexBar = /^(\d{8})(\s\|\s)(\S+\s*)+$/;
        const regexSID = /^\(\d{8}\)$/;

        if (value && regexBar.test(value)) {
            node.nodeValue = this.helper.censorData(value);
        } else if (value && regexSID.test(value)) {
            const parentNode = node.parentElement?.previousSibling?.previousSibling;
            if (parentNode && parentNode.nodeType === Node.TEXT_NODE) {
                const parentValue = parentNode.nodeValue;
                if (parentValue) {
                    parentNode.nodeValue = this.helper.censorData(parentValue);
                }
            }
        }
    };
};

/**
 * Creates an instance of `SimpleTemplateDataAlgorithm` that matches the current platform.
 * @returns The instantiated class.
 */
const getAlgorithm: AlgorithmInstantiatorFunction = (i, h) => {
    if (i.platform === "Workday") {
        return new SimpleTemplateDataAlgorithmWorkday(i, h);
    } else {
        return new SimpleTemplateDataAlgorithmAppian(i, h);
    }
};
export default getAlgorithm;