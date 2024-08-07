export enum BiographicType {None, Name, Other};

const flaggedNameLabels = ["Name", "Student", "Academic Record"];
const flaggedOtherLabels = [
    "Date of Birth",
    "Age",
    "Citizenship Status",
    "Trans Experience",
    "Gender",
    "Pronouns",
    "Address",
    "Phone Number",
    "Identification #",
    "Sex",
    "Contact Information"
];

export function checkForFlaggedText(text: string): BiographicType {
    const isNameLabel = flaggedNameLabels.reduce((a,l) => labelReduceCallback(a,l,text), false);
    if (isNameLabel) return BiographicType.Name;

    const isOtherLabel = flaggedOtherLabels.reduce((a,l) => labelReduceCallback(a,l,text), false);
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
    const beforeStuID = text.split(/\d/)[0];
    const beforeColon = beforeStuID.split(":")[0];
    const censored = replaceAlphaCharsWithDashes(beforeColon);
    return text.replace(beforeColon, censored);
}
function replaceTextWithDashes(source: string): string {
    return source.replace(/.+/, "-----");
}
function replaceAlphaCharsWithDashes(source: string): string {
    return source.replace(/[a-zA-Z]+/g, "-----");
}