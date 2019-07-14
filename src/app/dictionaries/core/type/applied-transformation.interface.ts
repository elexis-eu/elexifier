import { Transformation } from './transformation.interface';

export interface AppliedTransformationResponse {
  entity_xml: string;
  output: string;
  spec: Transformation;
}
