import type { Algorithm, AlgorithmInstantiatorFunction } from './algorithm';
import type { AlgorithmHelper } from './helper';
import type { ExtensionInfo } from "../extensionInfo";

abstract class SimpleTemplateDataAlgorithm implements Algorithm {
    extensionInfo: ExtensionInfo;
    helper: AlgorithmHelper;

    constructor(extensionInfo: ExtensionInfo, algorithmHelper: AlgorithmHelper) {
        this.extensionInfo = extensionInfo;
        this.helper = algorithmHelper;
    };

    /**
     * Traversal function that takes in a node and runs replaceNSIDName on itself and its children.
     * @param node - current HTML node
     */
    censorData(node: null | Node = null): void {
        if (!node) node = document.body;

        const children = node.childNodes;

        if (children.length === 0) {
            this.censorLeaf(node);
            return;
        }
    
        children.forEach(c => this.censorData(c));
    };

    /**
     * Replaces any text that matches the anonymizing regex.
     * @param node - current HTML node
     */
    abstract censorLeaf(node: Node): void
};
class SimpleTemplateDataAlgorithmWorkday extends SimpleTemplateDataAlgorithm {
    censorLeaf(node: Node): void {
        const value = node.nodeValue;
        if (node.nodeType !== Node.TEXT_NODE || !value) return;

        const regexWD = /^([\S\-]+\s+)+\(\d{8}\).*$/;
            if (value && regexWD.test(value)) {
                node.nodeValue = this.helper.replaceData(value);
        };
    };
};
class SimpleTemplateDataAlgorithmAppian extends SimpleTemplateDataAlgorithm {
    censorLeaf(node: Node): void {
        const value = node.nodeValue;
        if (node.nodeType !== Node.TEXT_NODE || !value) return;

        const regexBar = /^(\d{8})(\s\|\s)(\S+\s*)+$/;
        const regexSID = /^\(\d{8}\)$/;

        if (value && regexBar.test(value)) {
            node.nodeValue = this.helper.replaceData(value);
        } else if (value && regexSID.test(value)) {
            const parentNode = node.parentElement?.previousSibling?.previousSibling;
            if (parentNode && parentNode.nodeType === Node.TEXT_NODE) {
                const parentValue = parentNode.nodeValue;
                if (parentValue) {
                    parentNode.nodeValue = this.helper.replaceData(parentValue);
                }
            }
        }
    };
};

const getAlgorithm: AlgorithmInstantiatorFunction = (i, h) => {
    if (i.platform === "Workday") {
        return new SimpleTemplateDataAlgorithmWorkday(i, h);
    } else {
        return new SimpleTemplateDataAlgorithmAppian(i, h);
    }
};
export default getAlgorithm;