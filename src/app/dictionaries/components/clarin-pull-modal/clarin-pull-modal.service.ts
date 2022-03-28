import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ClarinPullModalComponent } from '@elexifier/dictionaries/components/clarin-pull-modal/clarin-pull-modal.component';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class ClarinPullModalService {

  private modalRef;

  public constructor(
    private dialogService: DialogService,
  ) {
  }

  public openClarinPullModal(): DynamicDialogRef {
    this.modalRef = this.dialogService.open(ClarinPullModalComponent, {
      width: '50%',
      // height: '100%',
      styleClass: 'upload-dictionary-modal',
      showHeader: false,
    });

    return this.modalRef;
  }
}
