import { NgModule } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { TransformationApiService } from '@elexifier/dictionaries/core/transformation-api.service';
import { TransformationService } from './transformation.service';
import { HighlightService } from './highlight.service';
import { XmlPrettifierPipe } from '../shared/xml-prettifier.pipe';

@NgModule({
  providers: [
    DialogService,
    DictionaryApiService,
    TransformationApiService,
    TransformationService,
    HighlightService,
    XmlPrettifierPipe,
  ],
})
export class CoreModule { }
