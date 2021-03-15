import { Injectable } from '@angular/core';
import { Transformer } from '@elexifier/dictionaries/core/type/transformer.interface';
import { TransformerType } from '@elexifier/dictionaries/core/type/transformer-type.enum';
import { Selector } from '@elexifier/dictionaries/core/type/selector.interface';
import { Transformation } from '@elexifier/dictionaries/core/type/transformation.interface';
import { DataHelperService } from '@elexifier/dictionaries/core/data-helper.service';
import { PseudoAttributes } from '@elexifier/dictionaries/core/type/pseudo-attributes.enum';
import { TransformationApiService } from '@elexifier/dictionaries/core/transformation-api.service';
import { MessageService } from 'primeng/api';
import {WorkflowStore} from '@elexifier/store/workflow.store';
import {map, switchMap} from 'rxjs/operators';
import {SidebarStore} from '@elexifier/store/sidebar.store';

@Injectable({
  providedIn: 'root',
})
export class TransformationService {

  set transformation(transformation) {
    this._transformation = this.removePrependsFromSelectors(transformation);
  }

  get transformation() {
    return this._transformation;
  }

  get transformationId() {
    return this._transformationId;
  }

  set transformationId(id) {
    this._transformationId = id;
  }

  get transformers(): { id: string, name: string }[] {
    const transformers: { id: string, name: string }[] = [];

    if (this._transformation) {
      return DataHelperService.extractTransformers(this._transformation);
    }
  }

  private _selectedHeadwordId: number;
  private _transformation: Transformation;
  private _transformationId: number;

  public constructor(
    private transformationApiService: TransformationApiService,
    private messageService: MessageService,
    private workflowStore: WorkflowStore,
    private sidebarStore: SidebarStore,
  ) {
    workflowStore.selectedTransformation$.subscribe((t: any) => {
      if (t) {
        this.transformation = t.transformation.transform;
        this.transformationId = t.transformation.id;
      }
    });
    workflowStore.selectedHeadword$.subscribe(h => {
      if (h) {
        this._selectedHeadwordId = h.id;
      }
    });
  }

  public addPosElement(posElement: string) {
    const transformer = this._transformation.pos as Transformer;
    if (!transformer.xlat) {
      transformer.xlat = {};
    }
    transformer.xlat[posElement] = '';
  }

  public removePosElement(posElement: string) {
    const transformer = this._transformation.pos as Transformer;
    delete transformer.xlat[posElement];
  }

  public addSelector(elementName, selector: Selector) {
    const transformer = this._transformation[elementName] as Transformer;
    const transformerType = this.getTransformerType(elementName) as string;

    switch (transformerType) {
      case 'rootXpath': {
        this._convertSelectorElementType(elementName, 'union');
        transformer.selectors.push(selector);
        break;
      }
      case 'rootUnion': {
        transformer.selectors.push(selector);
        break;
      }
      case 'basicSimple': {
        this._convertSelectorElementType(elementName, 'union');
        transformer.selector.selectors.push(selector);
        break;
      }
      case 'basicUnion': {
        transformer.selector.selectors.push(selector);
        break;
      }
    }
  }

  public addTransformer(transformerName: string) {
    if (this._transformation && !this._transformation[transformerName]) {
      const transformerData: { attr: string; selector: Selector; type: string; xlat?: any} = {
        type: TransformerType.Simple,
        selector: this._getDefaultSelector(),
        attr: PseudoAttributes.ElementInnerText,
      };

      if (transformerName === 'pos') {
        transformerData.xlat = {};
      }

      this._transformation[transformerName] = transformerData;
    } else if (this._transformation[transformerName].deleted) {
      this._transformation[transformerName].deleted = false;
    }

    this.transformation = DataHelperService.putElementsInOrder(this.transformation);
  }

  public applyPosValue(item, value) {
    this.transformation.pos.xlat[item] = value;
  }

  public getTransformationWithoutDeletedTransformers(): {
    transformation: Transformation,
    transformerDeleted: boolean,
  } {
    const newTransformation: Transformation = { ...this._transformation };
    let transformerDeleted = false;

    // Remove deleted transformers
    Object.keys(this._transformation)
      .forEach(k => {
        if (this._transformation[k].deleted) {
          delete newTransformation[k];
          if (this._transformation[`${k}_lang`]) {
            delete newTransformation[`${k}_lang`];
          }

          transformerDeleted = true;

          if (k === 'entry' || k === 'sense') {
            this._transformation[k].type = 'xpath';
            this._transformation[k].expr = 'dummy';
          }
        }
      });

    return {
      transformation: newTransformation,
      transformerDeleted,
    };
  }

  /**
   * Returns an imaginary type, used to distinguish which part of transformation (which transformer)
   * is being manipulated.
   * The specification structure has many different ways transformers are structured.
   *
   * This is a template helper function.
   *
   * @param transformerName
   * Name of the transformer
   * @param transformation
   * Optional transformation
   */
  public getTransformerType(transformerName: string, transformation?: string) {
    const transformer = transformation ? transformation[transformerName] as Transformer : this._transformation[transformerName] as Transformer;

    /**
     * Entry and Sense transformers are selectors.
     * Therefore their structure is different than the other types of transformers.
     *
     * Entry and Sense transformers can be of type 'xpath' at the root level.
     */

    // Check if transformer exists in so the template is not requiring it before its existence
    if (transformerName === 'entry' || transformerName === 'sense') {
      if (transformer.type === TransformerType.Root || transformer.type === TransformerType.Dummy) {
        /**
         * This means that the entry or sense transformers do not have a property 'selectors' (array).
         */

        return 'rootXpath';
      } else if (transformer.type === TransformerType.Union) {
        /**
         * This means that the entry or sense transformers have a property 'selectors' (array).
         */

        return 'rootUnion';
      }
    }

    if (Object.prototype.hasOwnProperty.call(transformer, 'selector')) {
      /**
       * This means that other transformer types have a property 'selector' containing a single selector
       */

      if (Object.prototype.hasOwnProperty.call(transformer.selector, 'selectors')) {
        /**
         * This means that other transformer types have a property 'selectors' containing multiple selectors
         */
        return 'basicUnion';
      }

      return 'basicSimple';
    }
  }

  public removePrependsFromSelectors(transformation) {
    if (transformation) {
      const newTransform = JSON.parse(JSON.stringify(transformation));
      const relativePathRegex = /^([\.\/\/])+/;

      Object.keys(transformation).forEach((transformerName) => {
        const transformer = newTransform[transformerName];
        const transformerType = this.getTransformerType(transformerName, newTransform);

        switch (transformerType) {
          case 'rootXpath': {
            if (transformer.type === TransformerType.Substract) {
              transformer.right.expr = transformer.right.expr.replace(relativePathRegex, '');
              transformer.left.expr = transformer.left.expr.replace(relativePathRegex, '');
              break;
            }
            transformer.expr = transformer.expr.replace(relativePathRegex, '');
            break;
          }
          case 'rootUnion': {
            transformer.selectors.forEach((s) => {
              if (s.type === TransformerType.Substract) {
                s.left.expr = s.left.expr.replace(relativePathRegex, '');
                s.right.expr = s.right.expr.replace(relativePathRegex, '');
              } else {
                s.expr = s.expr.replace(relativePathRegex, '');
              }
            });
            break;
          }
          case 'basicSimple': {
            if (transformer.selector.type === TransformerType.Substract) {
              transformer.selector.right.expr = transformer.selector.right.expr.replace(relativePathRegex, '');
              transformer.selector.left.expr = transformer.selector.left.expr.replace(relativePathRegex, '');
              break;
            }
            transformer.selector.expr = transformer.selector.expr.replace(relativePathRegex, '');
            break;
          }
          case 'basicUnion': {
            transformer.selector.selectors.forEach((s) => {
              if (s.type === TransformerType.Substract) {
                s.left.expr = s.left.expr.replace(relativePathRegex, '');
                s.right.expr = s.right.expr.replace(relativePathRegex, '');
              } else {
                s.expr = s.expr.replace(relativePathRegex, '');
              }
            });
            break;
          }
        }
      });

      return newTransform;
    }
  }

  public removeSelectorFromList(id: number, elementName: string) {
    const transformer = this._transformation[elementName];
    const transformerType = this.getTransformerType(elementName);
    let arr: Array<Selector>;

    switch (transformerType) {
      case 'rootXpath': {
        transformer.expr = '';
        // In case the selector was the last in line, we delete soft delete the transformer on the frontend
        transformer.deleted = true;
        break;
      }
      case 'rootUnion': {
        arr = transformer.selectors as Array<Selector>;
        arr.splice(id, 1);
        break;
      }
      case 'basicSimple': {
        transformer.selector.expr = '';
        // In case the selector was the last in line, we delete soft delete the transformer on the frontend
        transformer.deleted = true;
        break;
      }
      case 'basicUnion': {
        arr = transformer.selector.selectors as Array<Selector>;
        arr.splice(id, 1);
        break;
      }
    }

    if (arr && arr.length < 2) {
      this._convertSelectorElementType(elementName, TransformerType.Simple);
    }
  }

  public save(): void {
    /**
     * TODO:
     * Properly structure the data object.
     */
    const data = {
      xfspec: {},
    };

    data.xfspec = this.prepareTransformationForSaving();
    data.xfspec = DataHelperService.serializeLanguageModels(data.xfspec);
    // TODO: Save in parent

    this.transformationApiService.patchTransformation(this.transformationId, data)
      .pipe(
        switchMap((patched) => {
          if (patched) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Transformation successfully saved',
            });
            return this.transformationApiService.getTransformationById(this.transformationId);
          }
        }),
        map((transformationResponse) => {
          this.workflowStore.selectedTransformation = {
            transformation: transformationResponse.transform[0],
            entities: transformationResponse.entities,
          };
          this.sidebarStore.reload();
          this.workflowStore.selectedHeadword = this.workflowStore.selectedHeadword;
        }))
      .subscribe();
  }

  public setAllPosElements(elements: string[]) {
    const transformer = this._transformation.pos;
    let cachedXlat = {};
    if (transformer.xlat) {
      cachedXlat = {...transformer.xlat};
    }
    transformer.xlat = {};
    elements.filter(e => e.length).forEach(e => transformer.xlat[e] = '');

    Object.keys(cachedXlat).forEach(e => {
      if (Object.prototype.hasOwnProperty.call(transformer.xlat, e)) {
        transformer.xlat[e] = cachedXlat[e];
      }
    });
  }

  public subtractSelector(transformerName: string, id?: number) {
    const transformer: Transformer = this._transformation[transformerName];

    const transformerType = this.getTransformerType(transformerName);
    let selector: Selector;
    switch (transformerType) {
      case 'rootXpath': {
        transformer.selector = {...transformer};
        selector = transformer.selector;
        break;
      }
      case 'rootUnion': {
        selector = transformer.selectors[id];
        break;
      }
      case 'basicSimple': {
        selector = transformer.selector;
        break;
      }
      case 'basicUnion': {
        selector = transformer.selector.selectors[id];
        break;
      }
    }

    selector.left = {...selector};
    selector.type = 'exclude';
    selector.right = this._getDefaultSelector();
    delete selector.expr;
  }

  public unsubtractSelector(transformerName: string, side: string, id?: number) {
    const transformer: Transformer = this._transformation[transformerName];

    const transformerType = this.getTransformerType(transformerName);
    switch (transformerType) {
      case 'rootXpath': {
        transformer.selector = {...transformer};
        const _selector = transformer.selector;
        transformer.selector = getNewSelector(_selector, side);
        break;
      }
      case 'rootUnion': {
        const _selector = transformer.selectors[id];
        transformer.selectors[id] = getNewSelector(_selector, side);
        break;
      }
      case 'basicSimple': {
        const _selector = transformer.selector;
        transformer.selector = getNewSelector(_selector, side);
        break;
      }
      case 'basicUnion': {
        const _selector = transformer.selector.selectors[id];
        transformer.selector.selectors[id] = getNewSelector(_selector, side);
        break;
      }
    }

    function getNewSelector(_selector, _side) {
      delete _selector[_side];
      let newSelector = { ..._selector };

      delete _selector[_side];
      if (_selector.left) {
        newSelector = { ..._selector.left };
      } else {
        newSelector = { ..._selector.right };
      }

      return newSelector;
    }
  }

  public getSelectorValuesForPosFilter(transformer: Transformer): string[] {
    const isUnion = transformer.selector.selectors;

    let value;
    if (isUnion) {
      value = transformer.selector.selectors.map(s => {
        return s.left ? s.left.expr : s.expr;
      });
    } else {
      const isSubtracted = !!transformer.selector?.left;
      value = isSubtracted ? [transformer.selector?.left.expr] : [transformer.selector.expr];
    }

    return value;
  }

  private _convertSelectorElementType(elementName: string, type: string) {
    const transformer: Transformer = this._transformation[elementName];

    switch (type) {
      case TransformerType.Simple: {
        let lastSelector;
        if (elementName === 'entry' || elementName === 'sense') {
          // TODO: Handle for subtract
          lastSelector = transformer.selectors[0] as Selector;
          transformer.type = lastSelector.type;
          transformer.expr = lastSelector.expr;

          delete transformer.selectors;

          break;
        }

        transformer.selector.type = type;
        lastSelector = transformer.selector.selectors[0] as Selector;
        transformer.selector = lastSelector;

        delete transformer.selector.selectors;
        break;
      }
      case TransformerType.Union: {
        let selector: Selector;

        if (transformer.type === TransformerType.Root) {
          selector = {
            expr: transformer.expr,
            type: 'xpath',
          };

          transformer.type = type;

          const selectors = [];
          selectors.push(selector);
          transformer.selectors = selectors;

          delete transformer.expr;

          break;
        }

        if (transformer.selector) {
          selector = {...transformer.selector};
          transformer.selector.type = type;
          transformer.selector.selectors = [];
          transformer.selector.selectors.push(selector);

          delete transformer.selector.expr;
        }

        break;
      }
      default: {
        return console.error(`Type ${ type } is not a valid type.`);
      }
    }
  }

  private _getDefaultSelector(): Selector {
    return {
      expr: '',
      type: 'xpath',
    };
  }

  private prepareTransformationForSaving() {
    // Removing deleted transformers
    let { transformation } = this.getTransformationWithoutDeletedTransformers();

    // Mirroring XLAT property
    const transformer = transformation.pos;
    // if (transformer && transformer.xlat) {
    //     //   transformer.xlat = DataHelperService.mirrorObject(transformer.xlat);
    //     // }
    transformation = this.prependSelectorsRelatively(transformation);
    return transformation;
  }

  public prependSelectorsRelatively(transformation): Transformation {
    const newTransform = JSON.parse(JSON.stringify(transformation));

    Object.keys(transformation).forEach((transformerName) => {
      const transformer = newTransform[transformerName];
      const transformerType = this.getTransformerType(transformerName, newTransform);

      switch (transformerType) {
        case 'rootXpath': {
          if (transformer.type === TransformerType.Substract) {
            transformer.left.expr = `.//${transformer.left.expr}`;
            transformer.right.expr = `.//${transformer.right.expr}`;
            break;
          }
          transformer.expr = `.//${transformer.expr}`;
          break;
        }
        case 'rootUnion': {
          transformer.selectors.forEach((s) => {
            if (s.type === TransformerType.Substract) {
              s.left.expr = `.//${s.left.expr}`;
              s.right.expr = `.//${s.right.expr}`;
            } else {
              s.expr = `.//${s.expr}`;
            }
          });
          break;
        }
        case 'basicSimple': {
          if (transformer.selector.type === TransformerType.Substract) {
            transformer.selector.left.expr = `.//${transformer.selector.left.expr}`;
            transformer.selector.right.expr = `.//${transformer.selector.right.expr}`;
            break;
          }
          transformer.selector.expr = `.//${transformer.selector.expr}`;
          break;
        }
        case 'basicUnion': {
          transformer.selector.selectors.forEach((s) => {
            if (s.type === TransformerType.Substract) {
              s.left.expr = `.//${s.left.expr}`;
              s.right.expr = `.//${s.right.expr}`;
            } else {
              s.expr = `.//${s.expr}`;
            }
          });
          break;
        }
      }
    });

    return newTransform;
  }
}
