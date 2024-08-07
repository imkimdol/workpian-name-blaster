export enum BiographicType {None, Name, Other};

// WARNING: This function will be adjusted to return BiographicType
export function textIncludesFlaggedWord(text: string): boolean {
    const flaggedWords = ["Name", "Student", "Academic Record"];
    return flaggedWords.reduce(
        (acc, flaggedWord) => {
            if (acc) return true;
            return acc || text.includes(flaggedWord);
        },
        false
    );
}
export function replaceNodeName(node: Node) {
    const children = node.childNodes;
    const value = node.nodeValue;

    if (children.length === 0 && value && node.nodeType === Node.TEXT_NODE) {
        node.nodeValue = replaceName(value);
        return;
    }

    children.forEach(c => replaceNodeName(c));
}
export function replaceName(text: string): string {
    const beforeStuID = text.split(/\d/)[0];
    const beforeColon = beforeStuID.split(":")[0];
    const censored = replaceAlphaCharsWithDashes(beforeColon);
    return text.replace(beforeColon, censored);
}
export function replaceAlphaCharsWithDashes(source: string): string {
    return source.replace(/[a-zA-Z]+/g, "-----");
}