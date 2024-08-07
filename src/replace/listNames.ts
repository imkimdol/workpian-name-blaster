import type { BiographicType } from './helpers';

const helpers = await import(chrome.runtime.getURL("replace/helpers.js"));
const checkForFlaggedText: (text: string) => BiographicType = helpers.checkForFlaggedText;
const replaceNodeText: (node: Node, bioType: BiographicType) => void = helpers.replaceNodeText;

export default function replaceListNames() {
    const LIs = Array.from(document.getElementsByTagName("li"));
    LIs.forEach(l => scanLI(l));
}
function scanLI(element: HTMLElement) {
    const children = element.childNodes;
    if (children.length < 2) return;

    const firstChild = children[0]; // Assume first child is label
    const bioType = checkLabelForFlaggedText(firstChild);
    
    if (bioType) children.forEach((c, index) => {
        if (index === 0) return;
        replaceNodeText(c, bioType);
    });
}
function checkLabelForFlaggedText(node: Node): BiographicType {
    const children = Array.from(node.childNodes);
    if (children.length > 0) {
        for (const c of children) {
            const bioType = checkLabelForFlaggedText(c);
            if (bioType) return bioType;
        }
    }
    
    const value = node.nodeValue;
    if (value && node.nodeType === Node.TEXT_NODE) return checkForFlaggedText(value);

    return 0;
}