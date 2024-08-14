import type { ExtensionInfo } from "../extensionInfo";

export enum BiographicType {None, Name, Other};

const infoModule = await import(chrome.runtime.getURL("extensionInfo.js"));
const extensionInfo = new (infoModule.ExtensionInfo)() as ExtensionInfo;

/**
 * Checks if the string is included in the config as text to flag as sensitive data.
 * @param text - the string to check
 * @returns the BiographicType of the string, if a match was found in config, or type None otherwise
 */
export function checkForFlaggedText(text: string): BiographicType {
    // -- Checking if `text` matches any element in the Name labels --
    // a shorthand way to match `text` to all JSON entries in config.json
    const isNameLabel = extensionInfo.flaggedNameLabels.reduce((a,r) => labelReduceCallback(a,r,text), false);
    if (isNameLabel) return BiographicType.Name;

    // -- Checking if `text` matches any element in the Other labels --
    // a shorthand way to match `text` to all JSON entries in config.json
    const isOtherLabel = extensionInfo.flaggedOtherLabels.reduce((a,r) => labelReduceCallback(a,r,text), false);
    return isOtherLabel ? BiographicType.Other : BiographicType.None;
}

/**
 * Helper function for reducer that checks if `regexString` matches `string`.
 * @param accumulator - flag that indicates whether a match was found or not
 * @param regexString - the template string to compare to
 * @param text - the string to test
 * @returns `true` if regexString matches text, `false` otherwise
 */
function labelReduceCallback(accumulator: boolean, regex: RegExp, text: string) {
    if (accumulator) return true;
    return regex.test(text);
}

/**
 * Replaces the text in a Node, varying in replacment style depending on `BiographicType`.
 * @param node - the HTML Node to modify
 * @param bioType - if Name, replaces using logic involving names. Otherwise, replace everything.
 */
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

/**
 * Replaces just the name portion of a string.
 * 
 * This function depends on the following flags:
 * - `ScanUsingNumericPivot`: if true, strings will be split by any number in the string
 * - `SplitBeforeNumericPivot`: if `ScanUsingNumericPivot` is true, this determines which half of the string to keep at the number. Before if true, after if false
 * - `ScanUsingColonPivot`: if true, strings will be split by any colon (:) in the string
 * - `SplitBeforeColonPivot`: if `ScanUsingColonPivot` is true, this determins which half of the string to use. Before if true, after if false.
 * @param text - the string to be anonymized
 * @returns (string) the string with the specific portion anonymized
 */
export function replaceName(text: string): string {
    let beforeText = text;
    
    if (extensionInfo.scanUsingNumericPivot) {
        const split = beforeText.split(/\d/);
        if (extensionInfo.splitBeforeNumericPivot) beforeText = split[0];
        else if (beforeText.length > 1) beforeText = split[split.length - 1];
    }

    if (extensionInfo.scanUsingColonPivot) {
        const split = beforeText.split(":");
        if (extensionInfo.splitBeforeColonPivot) beforeText = split[0];       
        else if (beforeText.length > 1) beforeText = split[split.length - 1];
    }

    const censored = replaceAlphaCharsWithDashes(beforeText);
    return text.replace(beforeText, censored);
}

/**
 * Replaces all text with dashes.
 * @param source the string to be replaced
 * @returns (string) the new string with dashes
 */
function replaceTextWithDashes(source: string): string {
    return source.replace(/.+/, "-----");
}

/**
 * Replaces all alphabet characters with dashes.
 * @param source - the string to be replaced
 * @returns (string) the new string with dashes
 */
function replaceAlphaCharsWithDashes(source: string): string {
    return source.replace(/[a-zA-Z\-]+/g, "-----");
}