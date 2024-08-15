import type { Algorithm, AlgorithmInstantiatorFunction } from "./algorithm";
import type { DataType, AlgorithmHelper } from "./helper";
import type { ExtensionInfo } from "../extensionInfo";

/**
 * An algorithm used for censoring sensitive data in list form.
 *
 * List items consist of two parts: label and data.
 *
 * Data with a label that matches any expression in `extensionInfo` is considered sensitive.
 */
abstract class ListDataAlgorithm implements Algorithm {
  extensionInfo: ExtensionInfo;
  helper: AlgorithmHelper;

  constructor(extensionInfo: ExtensionInfo, algorithmHelper: AlgorithmHelper) {
    this.extensionInfo = extensionInfo;
    this.helper = algorithmHelper;
  }

  censorSensitiveData() {
    this.censorSensitiveListItems();
  }

  /**
   * Retrieves list items from the document and censors sensitive data.
   */
  protected abstract censorSensitiveListItems(): void;

  /**
   * Checks if an individual list item is sensitive. Censors contained data if item is sensitive.
   *
   * This function assumes that the first child of the list item is the label.
   *
   * @param element Current element
   */
  protected checkAndCensorListItem(element: Element) {
    const children = element.childNodes;
    if (children.length < 2) return;

    const label = children[0];
    const bioType = this.checkLabelForFlaggedTerms(label);

    if (bioType)
      children.forEach((c, index) => {
        if (index === 0) return;
        this.helper.censorNodeText(c, bioType);
      });
  }

  /**
   * Checks if the label's value matches any flagged expressions.
   *
   * It is possible for the provided label to be a nested node. All children's values are recursively checked.
   *
   * @param label Label to check
   * @returns `DataType` of the matching expression, if one exists. Returns `DataType.NonBiographic` otherwise.
   */
  private checkLabelForFlaggedTerms(label: Node): DataType {
    const children = Array.from(label.childNodes);
    if (children.length > 0) {
      for (const c of children) {
        const bioType = this.checkLabelForFlaggedTerms(c);
        if (bioType) return bioType;
      }
    }

    const value = label.nodeValue;
    if (label.nodeType === Node.TEXT_NODE && value)
      return this.helper.checkForFlaggedText(value);

    return 0; // DataType.NonBiographic
  }
}
class ListDataAlgorithmWorkday extends ListDataAlgorithm {
  censorSensitiveListItems(): void {
    const listItems = Array.from(document.getElementsByTagName("li"));
    listItems.forEach((i) => this.checkAndCensorListItem(i));
  }
}
class ListDataAlgorithmAppian extends ListDataAlgorithm {
  censorSensitiveListItems(): void {
    const Elements = Array.from(
      document.getElementsByClassName("SideBySideGroup---side_by_side"),
    );
    Elements.forEach((e) => this.checkAndCensorListItem(e));
  }
}

/**
 * Creates an instance of `ListDataAlgorithm` that matches the current platform.
 * @returns Instantiated class.
 */
const getAlgorithm: AlgorithmInstantiatorFunction = (i, h) => {
  if (i.platform === "Workday") {
    return new ListDataAlgorithmWorkday(i, h);
  } else {
    return new ListDataAlgorithmAppian(i, h);
  }
};
export default getAlgorithm;
