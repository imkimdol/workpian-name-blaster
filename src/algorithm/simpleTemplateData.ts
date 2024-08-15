import type { Algorithm, AlgorithmInstantiatorFunction } from "./algorithm";
import type { AlgorithmHelper } from "./helper";
import type { ExtensionInfo } from "../extensionInfo";

/**
 * An algorithm used for censoring data that matches a certain template.
 * (e.g. "`John Doe (12345678)`" or "`87654321 | Jane Doe`")
 *
 * Data that matches the template is considered sensitive.
 *
 * Uses recursive node traversal on the document body to find nodes that match the template.
 */
abstract class SimpleTemplateDataAlgorithm implements Algorithm {
  extensionInfo: ExtensionInfo;
  helper: AlgorithmHelper;

  constructor(extensionInfo: ExtensionInfo, algorithmHelper: AlgorithmHelper) {
    this.extensionInfo = extensionInfo;
    this.helper = algorithmHelper;
  }

  censorSensitiveData() {
    this.traverseNode();
  }

  /**
   * Recursive function that traverses all children in the current node.
   * If the current node is a leaf, checks the node for a template match.
   *
   * @param node Current node in traversal. If none is provided, the DOM body is used.
   */
  private traverseNode(node: Node = document.body): void {
    const children = node.childNodes;

    if (children.length === 0) {
      this.checkLeafNode(node);
      return;
    }

    children.forEach((c) => this.traverseNode(c));
  }
  /**
   * Checks the given leaf node's value. Censors the value if it matches the template.
   * @param node Leaf node
   */
  abstract checkLeafNode(node: Node): void;
}
class SimpleTemplateDataAlgorithmWorkday extends SimpleTemplateDataAlgorithm {
  checkLeafNode(node: Node): void {
    const value = node.nodeValue;
    if (node.nodeType !== Node.TEXT_NODE || !value) return;

    const regexWD = /^([\S\-]+\s+)+\(\d{8}\).*$/;
    if (value && regexWD.test(value)) {
      node.nodeValue = this.helper.censorNameData(value);
    }
  }
}
class SimpleTemplateDataAlgorithmAppian extends SimpleTemplateDataAlgorithm {
  checkLeafNode(node: Node): void {
    const value = node.nodeValue;
    if (node.nodeType !== Node.TEXT_NODE || !value) return;

    const regexBar = /^(\d{8})(\s\|\s)(\S+\s*)+$/;
    const regexSID = /^\(\d{8}\)$/;

    if (value && regexBar.test(value)) {
      node.nodeValue = this.helper.censorNameData(value);
    } else if (value && regexSID.test(value)) {
      const parentNode = node.parentElement?.previousSibling?.previousSibling;
      if (parentNode && parentNode.nodeType === Node.TEXT_NODE) {
        const parentValue = parentNode.nodeValue;
        if (parentValue) {
          parentNode.nodeValue = this.helper.censorNameData(parentValue);
        }
      }
    }
  }
}

/**
 * Creates an instance of `SimpleTemplateDataAlgorithm` that matches the current platform.
 * @returns Instantiated class.
 */
const getAlgorithm: AlgorithmInstantiatorFunction = (i, h) => {
  if (i.platform === "Workday") {
    return new SimpleTemplateDataAlgorithmWorkday(i, h);
  } else {
    return new SimpleTemplateDataAlgorithmAppian(i, h);
  }
};
export default getAlgorithm;
