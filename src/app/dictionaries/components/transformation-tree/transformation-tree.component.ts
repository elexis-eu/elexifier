import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {TransformationService} from '@elexifier/dictionaries/core/transformation.service';
import {Transformation} from '@elexifier/dictionaries/core/type/transformation.interface';
import {DataHelperService} from '@elexifier/dictionaries/core/data-helper.service';
import {PseudoAttributes} from '@elexifier/dictionaries/core/type/pseudo-attributes.enum';
import {ActivatedRoute} from '@angular/router';
import {TransformationApiService} from '@elexifier/dictionaries/core/transformation-api.service';
import {MessageService} from 'primeng/api';
import { debounce, debounceTime, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs/operators';
import {NgForm} from '@angular/forms';
import { BehaviorSubject, merge, Observable, of, Subject } from 'rxjs';
import {WorkflowStore} from '@elexifier/store/workflow.store';
import { Transformer } from '@elexifier/dictionaries/core/type/transformer.interface';
import {DictionaryApiService} from '@elexifier/dictionaries/core/dictionary-api.service';
import {PathBuilder} from '@elexifier/dictionaries/core/path-builder';
import { countryMap, langs } from '@elexifier/dictionaries/core/data/languages';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {
  ClarinPullModalComponent
} from '@elexifier/dictionaries/components/clarin-pull-modal/clarin-pull-modal.component';
import {
  TransformationErrorsModalService
} from '@elexifier/dictionaries/components/transformation-errors-modal/transformation-errors-modal.service';

enum TransformerElementsWorthOfExplanation {
  Definition = 'definition',
  Entry= 'entry',
  EntryLanguage = 'entry language',
  Example = 'example',
  Headword = 'headword',
  HeadwordTranslation = 'headword translation',
  HeadwordTranslationLanguage = 'headword translation language',
  PartOfSpeech = 'part of speech',
  SecondaryHeadword = 'secondary headword',
  Sense = 'sense',
}

const DEFINITION_TOOLTIP_TEXT = `A statement that describes a concept and permits its differentiation
from other concepts within a system of concepts.`;
const ENTRY_LANGUAGE_TOOLTIP_TEXT = 'The language of a lexical item (that is to be translated in another language).';
const ENTRY_TOOLTIP_TEXT = 'Part of a lexicographic resource which contains information related to at least one headword.';
const EXAMPLE_TOOLTIP_TEXT = 'An instance that is typical of a lexical item\'s usage in a specific sense.';
const HEADWORD_TOOLTIP_TEXT = `Organising element of an entry in a  lexicographic resource. In printed dictionaries typically at the top of an entry.`;
const SECONDARY_HEADWORD_TOOLTIP_TEXT = 'Headword-like lexical item occurring within an entry in a lexicographic resource, for example subheadwords, derived forms, feminine forms, multi-word expressions. In printed dictionaries typically at the bottom of an entry.';
const HEADWORD_TRANSLATION_LANGUAGE_TOOLTIP_TEXT = `The language into which a lexical item is to be translated.`;
const HEADWORD_TRANSLATION_TOOLTIP_TEXT = 'An equivalent lexical item belonging to a target language.';
const PART_OF_SPEECH_TOOLTIP_TEXT = `Any of the word classes to which a word may be assigned in a given language, based on form, meaning, or a combination of features, e.g. noun, verb, adjective, etc.`;
const SENSE_TOOLTIP_TEXT = 'Part of an entry which groups together information relating to one meaning of a headword (or secondary headword), for example definitions, examples, and translation equivalents.';

@Component({
  selector: 'app-transformation-tree',
  templateUrl: './transformation-tree.component.html',
  styleUrls: ['./transformation-tree.component.scss'],
})
export class TransformationTreeComponent implements OnInit, OnChanges {
  public allowedSelectorValues = [];
  @Output() public anchor = new EventEmitter();
  public autofocusEnabled = true;
  public dictionaryTags: JSON;
  public availableXmlNodes = [];
  public highlightedSelectorIndex = 0;
  public langs = langs;

  public DEFINITION_TOOLTIP_TEXT = DEFINITION_TOOLTIP_TEXT;
  @Input() public editable: boolean;
  public ENTRY_LANGUAGE_TOOLTIP_TEXT = ENTRY_LANGUAGE_TOOLTIP_TEXT;
  public ENTRY_TOOLTIP_TEXT = ENTRY_TOOLTIP_TEXT;
  public EXAMPLE_TOOLTIP_TEXT = EXAMPLE_TOOLTIP_TEXT;
  public filteredXmlNodes = [];
  @Input() public fixed: boolean;
  @ViewChild('form', { static: true }) public form: NgForm;
  public HEADWORD_TOOLTIP_TEXT = HEADWORD_TOOLTIP_TEXT;
  public HEADWORD_TRANSLATION_LANGUAGE_TOOLTIP_TEXT = HEADWORD_TRANSLATION_LANGUAGE_TOOLTIP_TEXT;
  public HEADWORD_TRANSLATION_TOOLTIP_TEXT = HEADWORD_TRANSLATION_TOOLTIP_TEXT;
  @Input() public mode = 'transformation';
  public objectKeys = Object.keys;
  public opened = false;
  public PART_OF_SPEECH_TOOLTIP_TEXT = PART_OF_SPEECH_TOOLTIP_TEXT;
  public PseudoAttributes = PseudoAttributes;
  public SECONDARY_HEADWORD_TOOLTIP_TEXT = SECONDARY_HEADWORD_TOOLTIP_TEXT;
  public selectedDictionaryDatabaseIndex;
  public SENSE_TOOLTIP_TEXT = SENSE_TOOLTIP_TEXT;
  @Input() public transformation: Transformation;
  public TransformerElementsWorthOfExplanation: typeof TransformerElementsWorthOfExplanation = TransformerElementsWorthOfExplanation;
  public transformers = [];
  public unusedPosElements = [];
  public unusedTransformers = [];
  private openedTransformers = [];
  public verifyingPaths = false;



  @ViewChild('instance', {static: true}) public instance: NgbTypeahead;
  public focus$ = new Subject<string>();
  public click$ = new Subject<string>();

  public selectorSearch$ = new Subject<string>();

  public posElementChange$ = new Subject();

  public constructor(
    private messageService: MessageService,
    private route: ActivatedRoute,
    private transformationApiService: TransformationApiService,
    public transformationService: TransformationService,
    private workflowStore: WorkflowStore,
    private dictionaryApiService: DictionaryApiService,
    private transformationErrorsModalService: TransformationErrorsModalService,
  ) {
    this.selectorSearch$.pipe(
      switchMap((partialElementString) => {
        const pathBuilder = new PathBuilder(this.dictionaryTags);
        this.verifyingPaths = true;
        const paths = pathBuilder.getPathsForTag(partialElementString);
        const splittedPaths = [];
        paths.forEach((p) => {
          splittedPaths.push(p.split('/'));
        });
        return this.dictionaryApiService.verifyPaths(this.selectedDictionaryDatabaseIndex, splittedPaths);
      }),
    ).subscribe(({paths}) => {
      this.verifyingPaths = false;
      const filteredPaths = [];
      paths.forEach((p) => {
        filteredPaths.push(p.join('/'));
      });
      this.filteredXmlNodes = filteredPaths;
    });
  }

  public autofocusTimeout() {
    this.autofocusEnabled = false;

    // Hack to prevent directive from focusing reloaded inputs
    setTimeout(() => {
      this.autofocusEnabled = true;
    }, 50);
  }

  public hasAdoptSelectorData(transformerName: string) {
    const transformer = this.transformation[transformerName];
    return !!transformer?.adoptSelector;
  }

  public getSelectorData(transformerName) {
    if (this.transformation && this.transformation[transformerName]) {
      const transformer = this.transformation[transformerName];
      const transformerType = this.getTransformerType(transformerName);

      switch (transformerType) {
        case 'rootXpath': {
          return transformer;
        }
        case 'rootUnion': {
          return transformer.selectors;
        }
        case 'basicSimple': {
          return transformer.selector;
        }
        case 'basicUnion': {
          return transformer.selector.selectors;
        }
      }
    }

    return null;
  }

  public onChangeLanguageOnFieldsRelatedToLanguage(transformerId, value) {
    this.transformation[`${transformerId}_lang`].const = value;
  }

  public getLanguageTransformer(transformerId: string): Transformer {
    const languageTransformer = this.transformation[`${transformerId}_lang`];

    if (!languageTransformer) {
      this.transformationService.addTransformer(`${transformerId}_lang`);

      this.transformation[`${transformerId}_lang`].const = '';
      this.transformation[`${transformerId}_lang`].type = 'simple';
    }
    this.transformation[`${transformerId}_lang`].attr = PseudoAttributes.Constant;
    this.getSelectorData(`${transformerId}_lang`).expr = this.getSelectorData(transformerId).expr;

    return this.transformation[`${transformerId}_lang`];
  }

  public getTransformerAttributeValue(transformerId: string) {
    return this.shouldShowCustomAttributeOption(transformerId) ? this.transformation[transformerId].attr : '';
  }

  public getTransformerType(transformerName) {
    if (this.transformation) {
      return this.transformationService.getTransformerType(transformerName);
    }
  }

  public onChangeSelector(transformerId: string, partialElement: string) {
    this.selectorSearch$.next(partialElement);
  }

  public selectorsChanged(transformerId: string) {
    if (transformerId === 'pos') {
      this.posElementChange$.next();
    }
  }

  public getUnusedPosItems(item) {
    return DataHelperService.getUnusedPartOfSpeechElements(this.transformation).map(t => t.name);
  }

  public isEntryOrSense(transformerName): boolean {
    /**
     * Entry and sense are treated differently than other transformers
     */
    return ['entry', 'sense'].indexOf(transformerName) !== -1;
  }

  public isTransformerOpened(transformer) {
    return this.openedTransformers.indexOf(transformer) !== -1;
  }

  public loadPartOfSpeechElements() {
    const transformer = this.transformation.pos;
    const posElementValue = this.transformationService.getSelectorValuesForPosFilter(transformer);

    const allPseudoAttributes = [
      PseudoAttributes.Constant.toString(),
      PseudoAttributes.ElementInnerText.toString(),
      PseudoAttributes.SubtreeText.toString(),
    ];

    const posElementAttribute = this.transformation.pos.attr;
    let attributeName =  '';
    if (allPseudoAttributes.indexOf(posElementAttribute) === -1) {
      attributeName = posElementAttribute;
    }
    this.transformationApiService
      .getAvailablePartOfSpeech(this.workflowStore.selectedDictionary.id, posElementValue, attributeName)
      .subscribe((res) => {
        if (res && res.pos.length > 0) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Pos elements loaded',
          });
          this.unusedPosElements = res.pos;
          this.transformationService.setAllPosElements(res.pos);
        }
      });
  }

  public searchLanguages = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => this.instance && !this.instance.isPopupOpen));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? countryMap
        : countryMap.filter(v => v.country.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10)),
    );
  }

  public languageInputFormatter = (x: {country: string, iso: string}) => `${x.country} (${x.iso})`;


  public ngOnChanges(): void {
    // Reloading the view
    this.transformers = DataHelperService.extractTransformers(this.transformation);
    this.refreshUnusedTransformers();
  }

  public ngOnInit() {
    this.posElementChange$.pipe(
      debounceTime(1000),
    ).subscribe(() => {
      this.loadPartOfSpeechElements();
    });

    const { dictionaryId } = this.route.snapshot.params;

    this.selectedDictionaryDatabaseIndex = dictionaryId;

    if (this.editable && dictionaryId) {
      this.dictionaryApiService.getDictionaryTags(dictionaryId)
        .subscribe((res) => {
          this.dictionaryTags = res;
        });

      // TODO: Probably should merge this and below blocks of code?
      this.transformationApiService.getAvailableNodes(dictionaryId).pipe(
        switchMap((res: { nodes: string[] }) => {
          this.availableXmlNodes = res.nodes;
          this.filteredXmlNodes = res.nodes;
          // TODO: Uncomment after xml_paths available again
          // return this.transformationApiService.getAvailablePaths(dictionaryId);
          return of(false);
        }),
      ).subscribe((paths: { nodes: string[] } | boolean) => {
        // TODO: Uncomment after xml_paths available again
        // this.availablePaths = paths.nodes;
        // this.allowedSelectorValues = [...this.availablePaths, ...this.availableXmlNodes];
      });

      let nodes = [];

      // TODO: Probably should merge this and above blocks of code?
      this.transformationApiService.getAvailableNodes(dictionaryId)
        .pipe(
          switchMap((res: { nodes: string[] }) => {
          nodes = [...res.nodes];

          // TODO: Uncomment after xml_paths available again
          // return this.transformationApiService.getAvailablePaths(dictionaryId);
          return of(false);
        }),
        )
        .subscribe((paths: { nodes: string[] } | boolean) => {
        // TODO: Uncomment after xml_paths available again
        // nodes = [...nodes, ...paths.nodes];
        //
        // this.allowedSelectorValues = nodes;
        // Object.keys(this.form.controls).forEach((key) => {
        //   this.form.controls[key].updateValueAndValidity();
        // });
      });
    }
  }

  public addAdoptSelector(transformerId): void {
    this.transformationService.addAdoptSelector(transformerId);
  }

  public removeAdoptSelector(transformerId): void {
    this.transformationService.removeAdoptSelector(transformerId);
  }

  public onAddSelector(transformerId): void {
    if (this.transformation[transformerId].deleted) {
      // If the last selector was deleted, hid it. In case the transformation gets saved,
      // entire transformer will be removed
      this.transformation[transformerId].deleted = false;
    } else {
      this.transformationService.addSelector(transformerId, {
        expr: '',
        type: 'xpath',
      });

      const type = this.transformationService.getTransformerType(transformerId);
      let selectors;
      switch (type) {
        case 'rootUnion': {
          selectors = this.transformation[transformerId].selectors;
          break;
        }
        case 'basicUnion': {
          selectors = this.transformation[transformerId].selector.selectors;
          break;
        }
      }
    }
  }

  public onAttributeTypeChange(e, transformerId): void {
    const value = e.target.value;
    if (value !== PseudoAttributes.Constant) {
      delete this.transformation[transformerId].const;
    }
  }

  public onDropSelector(e, transformerId): void {
    /**
     * Currently we are not supporting multiline drag and drop. <- STALE COMMENT
     * Now we are dragging vertically <- NEW COMMENT
     * Leaving this here in case ever needed
     * TODO: Use the following workaround in phase 2.
     * https://stackblitz.com/edit/angular-nuiviw
     */
    const type = this.transformationService.getTransformerType(transformerId);
    let selectors;
    switch (type) {
      case 'rootUnion': {
        selectors = this.transformation[transformerId].selectors;
        break;
      }
      case 'basicUnion': {
        selectors = this.transformation[transformerId].selector.selectors;
        break;
      }
    }

    const previousIndex = e.previousIndex;
    const newIndex = e.currentIndex;
    const movedItem = selectors[previousIndex];

    selectors.splice(previousIndex, 1);
    selectors.splice(newIndex, 0, movedItem);
  }

  public onRemoveSelector(arrayIndex, transformerId): void {
    this.autofocusTimeout();

    this.transformationService.removeSelectorFromList(arrayIndex, transformerId);
    this.refreshUnusedTransformers();
    this.selectorsChanged(transformerId);
  }

  public onSaveTransformation(valid: boolean) {
    DataHelperService.elementLanguagePairs.forEach((pair) => {
      const selector = this.getSelectorData(pair[1]);
      if (selector) {
        if (this.transformation[pair[0]].selector && this.transformation[pair[0]].selector.selectors) {
          this.transformation[pair[1]].selector = {...this.transformation[pair[0]].selector};
        } else {
          this.transformation[pair[1]].selector = this.getSelectorData(pair[0]);
        }
      }
    });

    if (valid) {
      this.transformationService.save();
    } else {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation',
        detail: 'All selectors require an existing node as value. Please check and fix selector values.',
      });
    }
  }

  public onSearchNode(e) {
    const input = e.query;
    const regexp = new RegExp(input, 'i');
    this.filteredXmlNodes = this.availableXmlNodes.filter(node => regexp.test(node));
  }

  public onSubtractSelector(transformerId, selectorId?): void {
    if (isNaN(selectorId)) {
      this.transformationService.subtractSelector(transformerId);
    } else {
      this.transformationService.subtractSelector(transformerId, selectorId);
    }
  }

  public onToggleCollapsed(transformerId) {
    const tranformerIndexInArray = this.openedTransformers.indexOf(transformerId);
    if (tranformerIndexInArray === -1) {
      this.openedTransformers.push(transformerId);
    } else {
      this.openedTransformers.splice(tranformerIndexInArray, 1);
    }
  }

  public onUnsubtractSelector(transformerId, side, selectorId?): void {
    this.autofocusTimeout();

    this.transformationService.unsubtractSelector(transformerId, side, selectorId);
  }

  public refreshUnusedTransformers() {
    this.unusedTransformers = DataHelperService.getUnusedTransformers(this.transformation)
      .filter((transformer) => transformer.addable === true)
      .map((t) => {
      return {
        label: t.name,
        id: t.id,
        command: () => {
          this.transformationService.addTransformer(t.id);
          this.openedTransformers.push(t.id);
          this.transformers = DataHelperService.extractTransformers(this.transformation);
        },
      };
    });
  }

  public shouldShowCustomAttributeOption(transformerId: string): boolean {
    const attributeIndex = Object.values(PseudoAttributes).indexOf(this.transformation[transformerId].attr);
    const attribute = this.transformation[transformerId].attr;

    return attributeIndex === -1 && attribute !== null && !this.isEntryOrSense(transformerId);
  }

  public toggleAnchor() {
    this.fixed = !this.fixed;
    this.anchor.emit(this.fixed);
  }

  public toggleTreeOpened() {
    this.opened = !this.opened;
  }

  public goDownSelectorList() {
    if (this.highlightedSelectorIndex < this.filteredXmlNodes.length - 1) {
      this.highlightedSelectorIndex ++;
    }
  }

  public goUpSelectorList() {
    if (this.highlightedSelectorIndex > 0) {
      this.highlightedSelectorIndex --;
    }
  }

  public selectSelector(transformer) {
    if (this.filteredXmlNodes[this.highlightedSelectorIndex]) {
      transformer.expr = `${this.filteredXmlNodes[this.highlightedSelectorIndex]}/`;
      this.onChangeSelector(transformer, transformer.expr);
      this.highlightedSelectorIndex = 0;
    }
  }

  public validateTransformation() {
    this.transformationApiService
      .validateTransformation(
        this.workflowStore.selectedTransformation.transformation.id,
        this.workflowStore.selectedHeadword.id,
      ).subscribe((res: any) => {

      if (res?.validation?.length) {
        this.transformationErrorsModalService.openTransformationErrorsModal(res.validation)
      }
    });
  }

}
