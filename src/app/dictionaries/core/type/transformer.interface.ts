import { Selector } from '@elexifier/dictionaries/core/type/selector.interface';

/**
 * A transformer is a rule that describes which data from the input document must be transformed
 * into a certain type of element in the output document.
 *
 * The description of a transformer must be a JSON object.
 * This object must contain an attribute named type, whose value specifies the type the transformer,
 * plus one or more other attributes whose name and meaning depends on the transformer type.
 *
 * The following types of transformers are currently supported:
 *
 * SIMPLE TRANSFORMERS
 *
 * A simple transformer selects a set of elements and extracts an attribute or the inner text from these elements;
 * optionally applies a regular expression to the resulting text and returns the substring
 * matched by a specific group within the regular expression.
 *
 * The JSON object that describes a simple transformer must contain the following attributes:
 *
 * type: this must be the string "simple".
 *
 * selector: a JSON object describing a selector.
 *
 * attr: the name of an attribute (from the elements selected by the selector) whose value is to be extracted.
 * To extract the inner text of the element, instead of an attribute,
 * use the pseudo-attribute name "{http://elex.is/wp1/teiLex0Mapper/meta}innerText".
 * To extract the inner text of the element and all of its descendants,
 * use "{http://elex.is/wp1/teiLex0Mapper/meta}innerTextRec".
 * To return a constant value instead of extracting the value of an attribute,
 * use the pseudo-attribute name "{http://elex.is/wp1/teiLex0Mapper/meta}constant".
 *
 * rex: a regular expression that is applied to the value of the attribute attr.
 * If this string does not contain any match for this regular expression,
 * the current element is not transformed (i.e. it is as if it hadn't been selected by the selector at all).
 * If there are several matches, the first one is used. This attribute is optional.
 * If present, it must use the Python regular expression syntax.
 *
 * rexGroup: this attribute is optional. If present, it must be the name of one of the named groups (?P<name>...)
 * from the regular expression given by the attribute rex. In this case, only the string that matched
 * this named group will be used, rather than the entire value of the attribute attr.
 *
 * const: this attribute should be present it attr was set to "{http://elex.is/wp1/teiLex0Mapper/meta}constant",
 * and should provide the constant value that you want to return as the result of the transformation.
 *
 * UNION TRANSFORMERS
 *
 * A union transformer takes a set of simple transformers and performs all of their transformations.
 * This might be useful if you need to combine several different transformation rules,
 * e.g. extract attribute @a from instances of the element <b> and also extract attribute @c
 * from instances of the element <d>.
 *
 * The JSON object that describes a union transformer must contain the following attributes:
 *
 * type: this must be the string "union".
 *
 * transformers: an array of JSON objects describing the transformers that are to be combined.
 */

// TODO: rename to transformer
export interface Transformer {
  attr?: string;
  attr_type?: string;
  const?: any;
  expr?: string;
  rex?: string;
  rexGroup?: string;
  selector?: {
    expr?: string;
    left?: Selector;
    right?: Selector;
    selector?: Selector;
    selectors?: Selector[];
    type?: string;
  };
  selectors?: Selector[];
  transformers?: Transformer[];
  type?: string;
  xlat?: any;
  // uuid?: string;
}
