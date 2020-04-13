import { Injectable } from '@angular/core';
import { CreateDictionaryAndOrTransformationModalComponent } from '@elexifier/dictionaries/components/create-dictionary-and-or-transformation-modal/create-dictionary-and-or-transformation-modal.component';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import {CreateDictionaryComponent} from '@elexifier/dictionaries/components/create-dictionary/create-dictionary.component';

@Injectable({
  providedIn: 'root',
})
export class AddDictionaryOrTransformationService {

  private modalRef;

  public constructor(
    private dialogService: DialogService,
  ) {}

  public openCreateDictionaryAndTransformationModal(): DynamicDialogRef {
    this.modalRef = this.dialogService.open(CreateDictionaryAndOrTransformationModalComponent, {
      width: '50%',
      // height: '100%',
      styleClass: 'upload-dictionary-modal',
      showHeader: false,
    });

    return this.modalRef;
  }

  public openCreateTransformationModal(dictionaryId): DynamicDialogRef {
    this.modalRef = this.dialogService.open(CreateDictionaryAndOrTransformationModalComponent, {
      data: {
        dictionaryId,
      },
      width: '50%',
      // height: '100%',
      styleClass: 'upload-dictionary-modal',
      showHeader: false,
    });

    return this.modalRef;
  }

  public openEditDictionaryMetadataModal(dictionaryId): DynamicDialogRef {
    this.modalRef = this.dialogService.open(CreateDictionaryComponent, {
      data: {
        dictionaryId,
        isEdit: true,
      },
      width: '50%',
      // height: '100%',
      styleClass: 'upload-dictionary-modal',
      showHeader: false,
    });

    return this.modalRef;
  }
}
