import { NgModule } from '@angular/core';
import { ListboxModule } from 'primeng/listbox';
import { ChipsModule } from 'primeng/chips';
import { SplitButtonModule } from 'primeng/splitbutton';
import { FileUploadModule } from 'primeng/fileupload';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { DictionariesRoutingModule } from './dictionaries-routing.module';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { DictionariesComponent } from '@elexifier/dictionaries/dictionaries.component';
import { DictionariesPageComponent } from '@elexifier/dictionaries/components/dictionaries-page/dictionaries-page.component';
import { SharedModule } from '@elexifier/shared/shared.module';
import { SharedModule as DictionariesSharedModule } from '@elexifier/dictionaries/shared/shared.module';
import { CoreModule } from '@elexifier/dictionaries/core/core.module';
import { CreateTransformationComponent } from '@elexifier/dictionaries/components/create-transformation/create-transformation.component';
import { CreateDictionaryComponent } from './components/create-dictionary/create-dictionary.component';
import { CreateDictionaryAndOrTransformationModalComponent } from './components/create-dictionary-and-or-transformation-modal/create-dictionary-and-or-transformation-modal.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CheckboxModule } from 'primeng/checkbox';
import { IconsModule } from '@elexifier/shared/icons.module';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TransformationsPageComponent } from '@elexifier/dictionaries/components/transformations-page/transformations-page.component';
import { TransformationTreeComponent } from '@elexifier/dictionaries/components/transformation-tree/transformation-tree.component';
import { DownloadTransformationComponent } from '@elexifier/dictionaries/components/download-transformation/download-transformation.component';
import { CalendarModule } from 'primeng/calendar';

@NgModule({
  declarations: [
    DictionariesComponent,
    DictionariesPageComponent,
    CreateTransformationComponent,
    CreateDictionaryComponent,
    CreateDictionaryAndOrTransformationModalComponent,
    CreateTransformationComponent,
    TransformationsPageComponent,
    TransformationTreeComponent,
    DownloadTransformationComponent,
  ],
    imports: [
      SharedModule,
      DictionariesSharedModule,
      DictionariesRoutingModule,
      CoreModule,
      ListboxModule,
      ChipsModule,
      SplitButtonModule,
      FileUploadModule,
      DropdownModule,
      InputTextModule,
      MenuModule,
      InputTextModule,
      ButtonModule,
      TableModule,
      DropdownModule,
      DynamicDialogModule,
      ListboxModule,
      AutoCompleteModule,
      DragDropModule,
      CheckboxModule,
      IconsModule,
      OverlayPanelModule,
      CalendarModule,
    ],
  entryComponents: [
    CreateDictionaryAndOrTransformationModalComponent,
    DownloadTransformationComponent,
    CreateDictionaryComponent
  ],
})
export class DictionariesModule {}
