import { Injectable } from '@angular/core';
import { Transformation } from '@elexifier/dictionaries/core/type/transformation.interface';
import { transcode } from 'buffer';
import { Transformer } from '@elexifier/dictionaries/core/type/transformer.interface';
import { getLangaugeByIso } from '@elexifier/dictionaries/core/data/languages';
export interface MetadataItem {
  formattedName?: string;
  name: string;
  objects?: {
    label?: string;
    name?: string;
    type?: string
  }[];
  required?: boolean;
  tooltip?: string;
  type?: string;
}
@Injectable({
  providedIn: 'root',
})
export class DataHelperService {

  public static availableTransformers = [{
    name: 'entry',
    id: 'entry',
    addable: true,
  }, {
    name: 'sense',
    id: 'sense',
    addable: true,
  }, {
    name: 'headword',
    id: 'hw',
    addable: true,
  }, {
    name: 'definition',
    id: 'def',
    addable: true,
  }, {
    name: 'headword translation',
    id: 'hw_tr',
    addable: true,
  }, {
    name: 'entry language',
    id: 'entry_lang',
    addable: false,
  }, {
    name: 'headword translation language',
    id: 'hw_tr_lang',
    addable: false,
  }, {
    name: 'example',
    id: 'ex',
    addable: true,
  }, {
    name: 'example translation',
    id: 'ex_tr',
    addable: true,
  }, {
    name: 'example translation language',
    id: 'ex_tr_lang',
    addable: false,
  }, {
    name: 'part of speech',
    id: 'pos',
    addable: true,
  }, {
    name: 'secondary headword',
    id: 'sec_hw',
    addable: true,
  }, {
    name: 'variant headword',
    id: 'variant',
    addable: true,
  }, {
    name: 'inflected form',
    id: 'inflected',
    addable: true,
  }, {
    name: 'label',
    id: 'usg',
    addable: true,
  }, {
    name: 'sense indicator',
    id: 'gloss',
    addable: true,
  }, {
    name: 'note',
    id: 'note',
    addable: true,
  }, {
    name: 'cross reference',
    id: 'xr',
    addable: true,
  }];

  public static elementLanguagePairs = [
    ['entry', 'entry_lang'],
    ['hw_tr', 'hw_tr_lang'],
    ['ex_tr', 'ex_tr_lang'],
  ];

  public static elementList = [
    'entry',
    'hw',
    'sec_hw',
    'pos',
    'sense',
    'def',
    'hw_tr',
    'ex',
    'ex_tr',
    'entry_lang',
    'hw_tr_lang',
    'ex_tr_lang',
    'variant',
    'inflected',
    'usg',
    'gloss',
    'note',
    'xr',
  ];

  public static languageElements = ['entry_lang', 'hw_tr_lang', 'ex_tr_lang'];

  public static metadata: MetadataItem[] = [
    {
      name: 'bibliographicCitation',
      formattedName: 'bibliographic citation',
      type: 'text',
      tooltip: 'A bibliographic reference for the resource.',
    },
    {
      name: 'title',
      type: 'text',
      tooltip: 'The title of the resource.',
    },
    {
      name: 'acronym',
      type: 'text',
      tooltip: 'The acronym of the resource.',
      required: true,
    },
    {
      name: 'publisher',
      type: 'text',
      tooltip: 'The publisher of This Resource.',
    },
    {
      name: 'license',
      type: 'text',
      tooltip: 'The license that can be used to republish this data.',
    },
    {
      name: 'created',
      type: 'date',
      tooltip: 'Date of creation of the resource.',
    },
    {
      name: 'extent',
      type: 'text',
      tooltip: 'The size or duration of the resource.',
    },
    {
      name: 'identifier',
      type: 'text',
      tooltip: 'An unambiguous reference to the resource within a given context.',
    },
    {
      name: 'source',
      type: 'text',
      tooltip: 'A related resource from which the described resource is derived.',
    },
    {
      name: 'Type',
      type: 'text',
      tooltip: 'Type of the resource: "Corpus" refers to text, speech and multimodal corpora. "Lexical Conceptual Resource" includes lexica, ontologies, dictionaries, word lists etc. "language Description" covers language models and grammars. "Technology / Tool / Service" is used for tools, systems, system components etc.',
      required: true,
    },
    {
      name: 'Project URL',
      type: 'text',
      tooltip: 'URL of resource/project related to the submitted item (eg. project webpage). Regexp controlled (starts with http/https)',
    },
    {
      name: 'Demo URL',
      type: 'text',
      tooltip: 'Demonstration, samples or in case of tools sample output URL. Regexp controlled (starts with http/https)',
    },
    {
      name: 'Date issued',
      type: 'date',
      tooltip: 'The date when the submission data were issued if any e.g., 2014-01-21 or at least the year.',
      required: true,
    },
    {
      name: 'Author',
      type: 'arrayOfString',
      tooltip: 'Names of authors of the item. In case of collections (eg. corpora or other large database of text) you usually want to provide the name of people involved in compiling the collection, not the authors of individual pieces. A person name is stored as surname comma any other name (eg. "Smith, John Jr.").',
      required: true,
    },
    {
      name: 'Publisher',
      type: 'arrayOfString',
      tooltip: 'Name of the organization/entity which published any previous instance of the item, or your home institution.',
      required: true,
    },
    {
      name: 'Contact person',
      type: 'arrayOfString',
      tooltip: 'Person to contact in case of issues with the submission. Someone able to provide information about the resource, eg. one of the authors, or the submitter. Stored as structured string containing given name, surname, email and home organization.',
      required: true,
    },
    {
      name: 'Funding',
      type: 'arrayOfString',
      tooltip: 'Person to contact in case of issues with the submission. Someone able to provide information about the resource, eg. one of the authors, or the submitter. Stored as structured string containing given name, surname, email and home organization.',
    },
    {
      name: 'Description',
      type: 'arrayOfString',
      tooltip: 'Person to contact in case of issues with the submission. Someone able to provide information about the resource, eg. one of the authors, or the submitter. Stored as structured string containing given name, surname, email and home organization.',
      required: true,
    },
    {
      name: 'Language',
      type: 'arrayOfString',
      tooltip: 'The language(s) of the main contenten of the item. Stored as ISO 639-3 code. Required for corpora, lexical conceptual resources and language descriptions.',
    },
    {
      name: 'Subject Keywords',
      type: 'arrayOfString',
      tooltip: 'Keywords or phrases related to the subject of the item.',
    },
    {
      name: 'Size',
      type: 'arrayOfString',
      tooltip: 'Extent of the submitted data, eg. the number of token, or number of files.',
    },
    {
      name: 'Media type',
      type: 'text',
      tooltip: 'Media type of the main content of the item, eg. text or audio. Dropdown selection, required for corpora, language descriptions and lexical conceptual resources.',
    },
    {
      name: 'Detailed type',
      type: 'text',
      tooltip: 'Further classification of the resource type. Dropdown selection, required for tools, language descriptions and lexical conceptual resources.',
    },
    {
      name: 'Language Dependent',
      type: 'boolean',
      tooltip: 'Boolean value indicating whether the described tool/service is language dependent or not. Required for tools',
    },
    {
      name: 'creator',
      type: 'arrayOfObject',
      tooltip: 'The creator of the resource.',
      objects: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
        },
        {
          name: 'email',
          type: 'text',
          label: 'Email',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Url',
        },
      ],
    },
    {
      name: 'contributor',
      type: 'arrayOfObject',
      tooltip: 'An entity responsible for making contributions to the resource.',
      objects: [
        {
          name: 'name',
          type: 'text',
          label: 'Name',
        },
        {
          name: 'email',
          type: 'text',
          label: 'Email',
        },
        {
          name: 'url',
          type: 'text',
          label: 'Url',
        },
      ],
    },
  ];

  public static partOfSpeechElementList = [
    'adj',
    'adp',
    'adv',
    'aux',
    'cconj',
    'det',
    'intj',
    'noun',
    'num',
    'part',
    'pron',
    'propn',
    'punct',
    'sconj',
    'sym',
    'verb',
    'x',
  ];


  public constructor() { }

  public static convertArraysInObjectToNull = (object) => {
    Object.keys(object).forEach((k) => {
      if (Array.isArray(object[k]) && object[k].length === 0) {
        object[k] = null;
      }
    });

    return object;
  }

  public static convertDatesInObjectToFormattedString = (object) => {
    Object.keys(object).forEach((k) => {
      if (object[k] instanceof Date) {
        object[k] = `${object[k].getFullYear()}-${object[k].getMonth() + 1}-${object[k].getDate()}`;
      }
    });

    return object;
  }


  public static convertFormattedStringInObjectToDates = (object) => {
    Object.keys(object).forEach((k) => {
      const field = DataHelperService.metadata.find((f) => f.name === k);
      if (field.type === 'date' && object[k]) {
        object[k] = new Date(Date.parse(object[k]));
      }
    });

    return object;
  }

  public static convertNulledArraysInObjectToArray = (object) => {
    Object.keys(object).forEach((k) => {
      // We convert arrays on save to null, because of api transformator handling.
      // Potentially dangerous
      const field = DataHelperService.metadata.find((f) => f.name === k);
      if (field.type === 'arrayOfObject' && object[k] === null) {
        object[k] = [];
      }
    });

    return object;
  }

  public static deserializeLanguageModels(transformation: Transformation): Transformation {
    const _transformation = JSON.parse(JSON.stringify(transformation));

    Object.keys(_transformation).forEach((t) => {
      if (this.languageElements.indexOf(t) > -1) {
        const transformer = _transformation[t] as Transformer;
        if (transformer.const) {
          const language = getLangaugeByIso(transformer.const);

          if (language) {
            _transformation[t].const = language;
          } else {
            _transformation[t].const = {
              country: transformer.const,
              iso: 'FIX ME!',
            };
          }
        }
      }
    });

    return _transformation;
  }

  public static extractTransformers(transformation) {
    const transformers = [];
    Object.keys(transformation).forEach((k) => {
      if (this.isATransformer(k)) {
        const transformer = {
          id: k,
          name: this.findTransformerNameByShortId(k),
        };
        transformers.push(transformer);
      }
    });

    return transformers;
  }

  public static findTransformerNameByShortId(transformerId) {
    return this.availableTransformers.find(t => t.id === transformerId).name;
  }

  public static getDefaultMetadataArrayItemFields(field) {
    const fieldData = this.metadata.find(o => o.name === field);
    return fieldData.objects.map(o => o.name);
  }

  public static getUnusedPartOfSpeechElements(transformation) {
    const transformer = transformation.pos;

    if (transformer && transformer.xlat) {
      const elements = [];
      this.partOfSpeechElementList.forEach((k) => {
          const posElement = {
            id: k,
            name: k,
          };
          elements.push(posElement);
      });
      return elements;
    }
  }

  public static getUnusedTransformers(transformation) {
    const transformers = [];
    this.availableTransformers.forEach((k) => {
      if (!transformation[k.id] || transformation[k.id].deleted) {
        const transformer = {
          id: k.id,
          name: this.findTransformerNameByShortId(k.id),
          addable: k.addable,
        };
        transformers.push(transformer);
      }
    });

    return transformers;
  }

  public static isATransformer(elementName: string): boolean {
    return this.elementList.indexOf(elementName) !== -1;
  }

  /**
   * **Designed for "Mirror part of speech object"**
   *
   * pos property in transformation requires structure like shown below
   * {
   *   "userInput": "staticKey"
   * }
   * This structure can not be used in current input
   * binding method so we mirror this object so we can use staticKey as a
   * ngModel bind and userInput as the value of staticKey
   *
   * Results in:
   * {
   *   "staticKey": "userInput"
   * }
   *
   */
  public static mirrorObject(object) {
    const o = {...object};
    Object.keys(object).forEach((k) => {
      o[o[k]] = k;
      delete o[k];
    });

    return o;
  }

  public static putElementsInOrder(transformation) {
    const orderedTransformation = {};

    DataHelperService.elementList.forEach((el) => {
      if (transformation[el]) {
        orderedTransformation[el] = transformation[el];
      }
    });

    return orderedTransformation;
  }

  public static serializeLanguageModels(transformation: Transformation): Transformation {
    const _transformation = JSON.parse(JSON.stringify(transformation));

    Object.keys(_transformation).forEach((t) => {
      if (this.languageElements.indexOf(t) > -1) {
        const transformer = _transformation[t] as Transformer;

        if (transformer.const && transformer.const.iso) {
          _transformation[t].const = transformer.const.iso;
        }
      }
    });

    return _transformation;
  }
}
