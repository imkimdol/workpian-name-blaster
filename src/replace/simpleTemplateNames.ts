import type { Config } from "../configParser";

const helpers = await import(chrome.runtime.getURL("replace/helpers.js"));
const replaceName: (text: string) => string = helpers.replaceName;
const configParser = await import(chrome.runtime.getURL("configParser.js"));
const config: Config = configParser.config;

// NSID = Names (Student ID)

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
    const regexWD = /^([\S\-]+\s+)+\(\d{8}\).*$/;
    const regexBar = /^(\d{8})(\s\|\s)(\S+\s*)+$/;
    const regexSID = /^\(\d{8}\)$/;

    if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue;
        if (config.currentPage === "appian") {
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
        } else {
            if (value && regexWD.test(value)) {
                node.nodeValue = replaceName(value);
            }
        }
    }

    
    
}