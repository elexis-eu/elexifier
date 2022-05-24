import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Injectable } from '@angular/core';
import {
  TransformationErrorsModalComponent
} from '@elexifier/dictionaries/components/transformation-errors-modal/transformation-errors-modal.component';

@Injectable({
  providedIn: 'root',
})
export class TransformationErrorsModalService {

  private modalRef;

  public constructor(
    private dialogService: DialogService,
  ) {
  }

  public openTransformationErrorsModal(errors: any[]): DynamicDialogRef {
    this.modalRef = this.dialogService.open(TransformationErrorsModalComponent, {
      width: '75%',
      // height: '100%',
      styleClass: 'upload-dictionary-modal',
      showHeader: false,
      data: {
        errors,
      },
    });

    return this.modalRef;
  }
}
