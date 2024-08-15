import type { ExtensionInfo } from "../extensionInfo";
/**
 * - `NonBiographic`: Not censored.
 * - `Name`: Alpha characters are censored.
 * - `Other`: All chraracter are censored.
 */
export enum DataType {
  NonBiographic,
  Name,
  Other,
}

/**
 * An abstraction that holds all common functions used by algorithm classes.
 */
export class AlgorithmHelper {
  private extensionInfo: ExtensionInfo;

  constructor(extensionInfo: ExtensionInfo) {
    this.extensionInfo = extensionInfo;
  }

  /**
   * Checks if the provided string matches an expression in `extensionInfo`.
   * @param text String to check
   * @returns `DataType` of the matching expression, if one exists. Returns `DataType.NonBiographic` otherwise.
   */
  checkForFlaggedText(text: string): DataType {
    for (const r of this.extensionInfo.flaggedNameExpressions) {
      const regexGlobal = new RegExp(r, "g");
      if (regexGlobal.test(text)) return DataType.Name;
    }
    for (const r of this.extensionInfo.flaggedOtherExpressions) {
      const regexGlobal = new RegExp(r, "g");
      if (regexGlobal.test(text)) return DataType.Other;
    }
    return DataType.NonBiographic;
  }

  /**
   * Recursive function that traverses all nodes in a node tree.
   * If the current node is a leaf, censor the node according to provided `DataType`.
   *
   * This function assumes that all children of the current node has the same `DataType`.
   *
   * @param node Current node in traversal
   * @param dataType Data type of `node`
   */
  censorNodeText(node: Node, dataType: DataType) {
    const children = node.childNodes;
    const value = node.nodeValue;

    if (children.length === 0 && value && node.nodeType === Node.TEXT_NODE) {
      if (dataType === DataType.Name) {
        node.nodeValue = this.censorNameData(value);
      } else {
        node.nodeValue = this.replaceTextWithDashes(value);
      }
      return;
    }

    children.forEach((c) => this.censorNodeText(c, dataType));
  }

  /**
   * Censors names from the provided string. This function uses subalgorithms to isolate the name from the string.
   * - Numeric divider subalgorithm: Only censors text before the first numeric character or after the last numeric character.
   * - Colon divider subalgorithm:   Only censors text before the first colon or after the last colon.
   *
   * These subalgorithms are controlled by values in `extensionInfo`:
   * - `useNumericDividerSubalgorithm`: If true, the numeric divider subalgorithm will be used.
   * - `useTextBeforeNumericDivider`:   If true, text before the numeric divider will be censored. If false, censors after divider.
   * - `useColonDividerSubalgorithm`:   If true, the colon divider subalgorithm will be used.
   * - `useTextBeforeColonDivider`:     If true, text before the colon divider will be censored. If false, censors after divider.
   *
   * @param text String to be censored
   * @returns Censored string
   */
  censorNameData(text: string): string {
    let beforeText = text;

    if (this.extensionInfo.useNumericDividerSubalgorithm) {
      const split = beforeText.split(/\d/);
      if (this.extensionInfo.useTextBeforeNumericDivider) beforeText = split[0];
      else if (beforeText.length > 1) beforeText = split[split.length - 1];
    }

    if (this.extensionInfo.useColonDividerSubalgorithm) {
      const split = beforeText.split(":");
      if (this.extensionInfo.useTextBeforeColonDivider) beforeText = split[0];
      else if (beforeText.length > 1) beforeText = split[split.length - 1];
    }

    const censored = this.replaceAlphaCharsWithDashes(beforeText);
    return text.replace(beforeText, censored);
  }

  /**
   * Replaces all characters in the provided string with dashes.
   * @param source String to be replaced
   * @returns String with replacements
   */
  private replaceTextWithDashes(source: string): string {
    return source.replace(/.+/, "-----");
  }

  /**
   * Replaces all alphabet characters in the provided string with dashes.
   * @param source String to be replaced
   * @returns String with replacements
   */
  private replaceAlphaCharsWithDashes(source: string): string {
    return source.replace(/[a-zA-Z\-]+/g, "-----");
  }
}
