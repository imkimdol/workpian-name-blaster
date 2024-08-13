const helpers = await import(chrome.runtime.getURL("replace/helpers.js"));
const replaceName: (text: string) => string = helpers.replaceName;

// NSID = Names (Student ID)

/**
 * Traversal function that takes in a node and runs replaceNSIDName on itself and its children.
 * @param node - current HTML node
 */
export default function replaceNSIDNames(node: Node | null = null) {
    if (!node) node = document.body;

    const children = node.childNodes;

    if (children.length === 0) {
        replaceNSIDName(node);
        return;
    }
    
    children.forEach(c => replaceNSIDNames(c));
}

/**
 * Replaces any text that matches the anonymizing regex.
 * @param node - current HTML node
 */
function replaceNSIDName(node: Node) {
    const regex = /^([\S\-]+\s+)+\(\d{8}\).*$/;
    if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue;
        if (value && regex.test(value)) {
            node.nodeValue = replaceName(value);
        }
    }
}