import type { Config } from "../configParser";

export enum BiographicType {None, Name, Other};

const configParser = await import(chrome.runtime.getURL("configParser.js"));
const config: Config = configParser.config;

export function checkForFlaggedText(text: string): BiographicType {
    const isNameLabel = config.flaggedNameLabels.reduce((a,l) => labelReduceCallback(a,l,text), false);
    if (isNameLabel) return BiographicType.Name;

    const isOtherLabel = config.flaggedOtherLabels.reduce((a,l) => labelReduceCallback(a,l,text), false);
    return isOtherLabel ? BiographicType.Other : BiographicType.None;
}
function labelReduceCallback(accumulator: boolean, label: string, text: string) {
    if (accumulator) return true;
    return accumulator || text.includes(label);
}
export function replaceNodeText(node: Node, bioType: BiographicType) {
    const children = node.childNodes;
    const value = node.nodeValue;

    if (children.length === 0 && value && node.nodeType === Node.TEXT_NODE) {
        if (bioType === BiographicType.Name) {
            node.nodeValue = replaceName(value);
        } else {
            node.nodeValue = replaceTextWithDashes(value);
        }
        return;
    }

    children.forEach(c => replaceNodeText(c, bioType));
}
export function replaceName(text: string): string {
    let beforeText = text;
    
    if (config.NSIDReplaceBeforeNumeric) beforeText = beforeText.split(/\d/)[0];
    if (config.NSIDReplaceBeforeColon) beforeText = beforeText.split(":")[0];

    const censored = replaceAlphaCharsWithDashes(beforeText);
    return text.replace(beforeText, censored);
}
function replaceTextWithDashes(source: string): string {
    return source.replace(/.+/, "-----");
}
function replaceAlphaCharsWithDashes(source: string): string {
    return source.replace(/[a-zA-Z]+/g, "-----");
}