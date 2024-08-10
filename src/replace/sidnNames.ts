const helpers = await import(chrome.runtime.getURL("replace/helpers.js"));
const replaceName: (text: string) => string = helpers.replaceName;

// SIDN = Student ID | Name 

/**
 * Traversal function that takes in a node and runs replaceNSIDName on itself and its children.
 * @param node - current HTML node
 */
export default function replaceSIDNNames(node: Node | null = null) {
    if (!node) node = document.body;

    const children = node.childNodes;

    if (children.length === 0) {
        replaceSIDNName(node);
        return;
    }
    
    children.forEach(c => replaceSIDNNames(c));
}

/**
 * Replaces any text that matches the anonymizing regex. In Appian, this manifests two ways:
 * 1. If the string matches "12345678 | Text" or similar, replace just Text
 * 2. If the string matches "(12345678)" or similar, replace the entirety of the parent's text.
 * @param node - current HTML node
 */
function replaceSIDNName(node: Node) {
    const regexBar = /^(\d{8})(\s\|\s)(\S+\s*)+$/;
    const regexSID = /^\(\d{8}\)$/;
    if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue;
        if (value && regexBar.test(value)) {
            node.nodeValue = replaceName(value);
        }
        else if (value && regexSID.test(value)) {
            const parentNode = node.parentElement?.previousSibling?.previousSibling;
            if (parentNode && parentNode.nodeType === Node.TEXT_NODE) {
                const parentValue = parentNode.nodeValue;
                if (parentValue) {
                    parentNode.nodeValue = replaceName(parentValue);
                }
            }
        }
    }
}