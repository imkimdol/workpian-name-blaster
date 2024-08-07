const helpersUrl = chrome.runtime.getURL("replace/helpers.js");
const { textIncludesFlaggedWord, replaceNodeName } = await import(helpersUrl);

export default function replaceListNames() {
    const LIs = Array.from(document.getElementsByTagName("li"));
    LIs.forEach(l => scanLI(l));
}
function scanLI(element: HTMLElement) {
    const children = element.childNodes;
    if (children.length < 2) return;

    const firstChild = children[0]; // Assume first child is label
    const isName = checkChildHasName(firstChild);
    
    if (isName) children.forEach((c, index) => {
        if (index === 0) return;
        replaceNodeName(c);
    });
}
function checkChildHasName(node: Node): boolean {
    const children = Array.from(node.childNodes);
    if (children.length > 0) {
        return children.reduce(
            (acc, c) => {
                if (acc) return true;
                return acc || checkChildHasName(c);
            },
            false
        );
    }
    
    const value = node.nodeValue;
    if (value && node.nodeType === Node.TEXT_NODE) return textIncludesFlaggedWord(value);

    return false
}