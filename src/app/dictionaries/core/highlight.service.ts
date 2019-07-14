import { Injectable } from '@angular/core';

import 'prismjs';
import 'prismjs/plugins/toolbar/prism-toolbar';
import 'prismjs/plugins/normalize-whitespace/prism-normalize-whitespace';
import 'prismjs/components/prism-markup';
import { XmlPrettifierPipe } from '@elexifier/dictionaries/shared/xml-prettifier.pipe';

declare var Prism: any;

@Injectable({
  providedIn: 'root',
})
export class HighlightService {
  private _originalXmlHighlighted: string;
  private _outputTeiHighlighted: string;

  // TODO: remove
  set originalXml(originalXml: string) {
    this._originalXmlHighlighted = this._highlight(this.xmlPrettifierPipe.transform(originalXml), 'xml');
  }

  // TODO: remove
  get originalXml() {
    return this._originalXmlHighlighted;
  }

  // TODO: remove
  set outputTei(outputTei: string) {
    this._outputTeiHighlighted = this._highlight(this.xmlPrettifierPipe.transform(outputTei), 'xml');
  }

  // TODO: remove
  get outputTei() {
    return this._outputTeiHighlighted;
  }

  public constructor(
    private xmlPrettifierPipe: XmlPrettifierPipe,
  ) {}

  public clearOutputs() {
    this._originalXmlHighlighted = this._highlight('', 'xml');
    this._outputTeiHighlighted = this._highlight('', 'xml');
  }

  private _highlight = (code, lang): string => Prism.highlight(code, Prism.languages[lang], lang);
}
