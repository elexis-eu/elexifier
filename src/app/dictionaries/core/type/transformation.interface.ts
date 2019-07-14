// TODO: import correct transformer
import { Transformer } from '@elexifier/dictionaries/core/type/transformer.interface';

// Reference: http://capybara.ijs.si/janez/elexis/transformDemo.html#syntax
/**
 * entry — describes the selector for entry elements
 * entry_lang — describes the transformer for the language attribute of the entries
 * sense — describes the selector for sense elements
 * hw — describes the transformer for headwords
 * hw_tr — describes the transformer for translations of headwords
 * hw_tr_lang — describes the transformer for the language of the translations of headwords
 * ex — describes the transformer for examples
 * ex_tr — describes the transformer for translations of examples
 * ex_tr_lang — describes the transformer for the language of the translations of examples
 * def — describes the transformer for definitions
 */

export interface Transformation {
  def?: Transformer;
  entry?: Transformer;
  entry_lang?: Transformer;
  ex?: Transformer;
  ex_tr?: Transformer;
  ex_tr_lang?: Transformer;
  hw?: Transformer;
  hw_tr?: Transformer;
  hw_tr_lang?: Transformer;
  pos?: Transformer;
  sense?: Transformer;
}
