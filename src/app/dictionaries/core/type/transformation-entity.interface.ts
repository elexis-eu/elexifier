import { Transformation } from './transformation.interface';
import { Headword } from './headword.interface';

export interface TransformationEntityResponse {
  entities: Headword[];
  transform: Array<{ transform: Transformation }>;
}
