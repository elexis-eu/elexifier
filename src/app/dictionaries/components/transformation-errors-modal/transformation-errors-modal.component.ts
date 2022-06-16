import { Component, OnInit } from '@angular/core';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-transformation-errors-modal',
  templateUrl: './transformation-errors-modal.component.html',
  styleUrls: ['./transformation-errors-modal.component.scss'],
})
export class TransformationErrorsModalComponent implements OnInit {
  public errors: string[] = [];

  public constructor(
    public readonly ref: DynamicDialogRef,
    public readonly config: DynamicDialogConfig
  ) { }

  public ngOnInit() {
    this.errors = this.config.data.errors.map(e => JSON.stringify(e, null, 2));
  }
}
