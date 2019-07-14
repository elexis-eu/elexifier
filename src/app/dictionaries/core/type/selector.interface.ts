/**
 * A selector is a rule that selects 0 or more elements in the input XML tree.
 * The description of a selector must be a JSON object.
 *
 * This object must contain an attribute named type,
 * whose value specifies the type the selector, plus one or more other attributes
 * whose name and meaning depends on the selector type.
 *
 * The following types of selectors are currently supported:
 *
 * Xpath selector: selects the nodes that match a given xpath expression (given in an attribute named expr). Example:
 * {"type": "xpath", "expr": ".//Voorbeeld/Tekst"}
 *
 * Union selector: combines the results of several selectors (whose descriptions must be given as a JSON array
 * in an attribute named selectors). Example:
 * {"type": "union", "selectors": [...]}
 *
 * Exclude selector: takes two selectors, left and right, and selects all those nodes
 * which were selected by left but not by right. Example:
 * {"type": "exclude", "left": {...}, "right": {...}}
 */

export interface Selector {
  expr?: string;
  left?: Selector;
  right?: Selector;
  type?: string;
  // uuid?: string;
}
