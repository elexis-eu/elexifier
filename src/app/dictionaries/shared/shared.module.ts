import { NgModule } from '@angular/core';
import { XmlPrettifierPipe } from './xml-prettifier.pipe';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import {ContentEditableFormDirective} from '@elexifier/dictionaries/shared/content-editable.directive';
import {AutoFocusDirective} from '@elexifier/dictionaries/shared/autofocus.directive';
import {SelectorValidatorDirective} from '@elexifier/dictionaries/shared/selector-validator.directive';

@NgModule({
  declarations: [
    XmlPrettifierPipe,
    ContentEditableFormDirective,
    AutoFocusDirective,
    SelectorValidatorDirective,
  ],
  imports: [
    ProgressSpinnerModule,
  ],
  exports: [
    XmlPrettifierPipe,
    ProgressSpinnerModule,
    ContentEditableFormDirective,
    AutoFocusDirective,
    SelectorValidatorDirective,
  ],
})
export class SharedModule { }
