const helpersUrl = chrome.runtime.getURL("replace/helpers.js");
const { replaceName } = await import(helpersUrl);

// NSID = Names (Student ID)
export default function replaceNSIDNames(node: Node | null) {
    if (!node) node = document.body;

    const children = node.childNodes;

    if (children.length === 0) {
        replaceNSIDName(node);
        return;
    }
    
    children.forEach(c => replaceNSIDNames(c));
}
function replaceNSIDName(node: Node) {
    const regex = /^(\S+\s+)+\(\d{8}\).*$/;
    if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue;
        if (value && regex.test(value)) {
            node.nodeValue = replaceName(value);
        }
    }
}