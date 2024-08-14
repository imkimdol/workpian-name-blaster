import type { ExtensionInfo } from "../extensionInfo";

const helpers = await import(chrome.runtime.getURL("replace/helpers.js"));
const replaceName: (text: string) => string = helpers.replaceName;

const infoModule = await import(chrome.runtime.getURL("extensionInfo.js"));
const extensionInfo = infoModule.info as ExtensionInfo;

/**
 * Traversal function that takes in a node and runs replaceNSIDName on itself and its children.
 * @param node - current HTML node
 */
export default function replaceSimpleTemplateNames(node: Node | null = null) {
    if (!node) node = document.body;

    const children = node.childNodes;

    if (children.length === 0) {
        replaceSimpleTemplateName(node);
        return;
    }
    
    children.forEach(c => replaceSimpleTemplateNames(c));
}

/**
 * Replaces any text that matches the anonymizing regex.
 * @param node - current HTML node
 */
function replaceSimpleTemplateName(node: Node) {
    const value = node.nodeValue;

    if (node.nodeType === Node.TEXT_NODE && value) {
        if (extensionInfo.platform === "Workday") {
            replaceSimpleTemplateNameWorkday(node, value);
        } else {
            replaceSimpleTemplateNameAppian(node, value);
        }
    }   
}

function replaceSimpleTemplateNameWorkday(node: Node, value: string) {
    const regexWD = /^([\S\-]+\s+)+\(\d{8}\).*$/;
    if (value && regexWD.test(value)) {
        node.nodeValue = replaceName(value);
    }
};

function replaceSimpleTemplateNameAppian(node: Node, value: string) {
    const regexBar = /^(\d{8})(\s\|\s)(\S+\s*)+$/;
    const regexSID = /^\(\d{8}\)$/;

    if (value && regexBar.test(value)) {
        node.nodeValue = replaceName(value);
    } else if (value && regexSID.test(value)) {
        const parentNode = node.parentElement?.previousSibling?.previousSibling;
        if (parentNode && parentNode.nodeType === Node.TEXT_NODE) {
            const parentValue = parentNode.nodeValue;
            if (parentValue) {
                parentNode.nodeValue = replaceName(parentValue);
            }
        }
    }
};