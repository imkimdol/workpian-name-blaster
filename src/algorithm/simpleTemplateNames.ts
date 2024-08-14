import type { Algorithm, AlgorithmInstantiatorFunction } from './algorithm';
import type { AlgorithmHelper } from './helper';
import type { ExtensionInfo } from "../extensionInfo";

class SimpleTemplateNamesAlgorithm implements Algorithm {
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
            this.replaceSimpleTemplateName(node);
            return;
        }
    
        children.forEach(c => this.censorData(c));
    };

    /**
     * Replaces any text that matches the anonymizing regex.
     * @param node - current HTML node
     */
    private replaceSimpleTemplateName(node: Node) {
        const value = node.nodeValue;

        if (node.nodeType === Node.TEXT_NODE && value) {
            if (this.extensionInfo.platform === "Workday") {
                this.replaceSimpleTemplateNameWorkday(node, value);
            } else {
                this.replaceSimpleTemplateNameAppian(node, value);
            }
        }   
    }

    private replaceSimpleTemplateNameWorkday(node: Node, value: string) {
        const regexWD = /^([\S\-]+\s+)+\(\d{8}\).*$/;
        if (value && regexWD.test(value)) {
            node.nodeValue = this.helper.replaceName(value);
        }
    };

    private replaceSimpleTemplateNameAppian(node: Node, value: string) {
        const regexBar = /^(\d{8})(\s\|\s)(\S+\s*)+$/;
        const regexSID = /^\(\d{8}\)$/;

        if (value && regexBar.test(value)) {
            node.nodeValue = this.helper.replaceName(value);
        } else if (value && regexSID.test(value)) {
            const parentNode = node.parentElement?.previousSibling?.previousSibling;
            if (parentNode && parentNode.nodeType === Node.TEXT_NODE) {
                const parentValue = parentNode.nodeValue;
                if (parentValue) {
                    parentNode.nodeValue = this.helper.replaceName(parentValue);
                }
            }
        }
    };
};

const getAlgorithm: AlgorithmInstantiatorFunction = (i, h) => {
    return new SimpleTemplateNamesAlgorithm(i, h);
}
export default getAlgorithm;