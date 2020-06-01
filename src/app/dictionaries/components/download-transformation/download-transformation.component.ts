import {Component, OnDestroy, OnInit} from '@angular/core';
import {DynamicDialogRef} from 'primeng/dynamicdialog';
import {FileTypes} from '@elexifier/dictionaries/core/type/file-types.enum';
import {WorkflowStore} from '@elexifier/store/workflow.store';
import {TransformationApiService} from '@elexifier/dictionaries/core/transformation-api.service';
import { saveAs } from 'file-saver';
import { interval, Subscription } from 'rxjs';
import { switchMap} from 'rxjs/operators';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-download-transformation',
  templateUrl: './download-transformation.component.html',
})
export class DownloadTransformationComponent implements OnInit, OnDestroy {
  public fileChecker: Subscription;
  public fileStatus;

  public constructor(
    public ref: DynamicDialogRef,
    public workflowStore: WorkflowStore,
    public transformationApiService: TransformationApiService,
  ) {
  }

  public checkForPreparedFile(): void {
    this.fileChecker = interval(3000)
      .pipe(
        switchMap(_ => this.transformationApiService
          .checkFileStatus(
            this.workflowStore.selectedTransformation.transformation.id,
            this.workflowStore.selectedDictionary.id)),
        ).subscribe((response: any) => {
          this.fileStatus = response.status;

          if (this.fileStatus === 'Ready') {
            this.fileChecker.unsubscribe();
          }
      });
  }

  public downloadFile() {
    this.transformationApiService.downloadTransformation(
      this.workflowStore.selectedTransformation.transformation.id,
      this.workflowStore.selectedDictionary.id,
    ).subscribe((fileResponse) => {
      this.ref.close();
      this.handleReceivedFile(fileResponse);
      this.fileChecker.unsubscribe();
    });
  }

  public ngOnDestroy() {
    this.fileChecker.unsubscribe();
  }

  public ngOnInit() {
    this.transformationApiService.checkFileStatus(
      this.workflowStore.selectedTransformation.transformation.id,
      this.workflowStore.selectedDictionary.id,
    ).subscribe((res) => {
      this.fileStatus = res.status;

      if (this.fileStatus === 'Processing') {
        this.checkForPreparedFile();
      }
    });
  }

  public onSelectDownloadOption(stripNs) {
    this.transformationApiService
      .prepareTransformationDownload(this.workflowStore.selectedTransformation.transformation.id, this.workflowStore.selectedDictionary.id, stripNs)
      .subscribe((transformationData: any) => {
        this.fileStatus = 'Processing';
        this.checkForPreparedFile();
      });
  }

  private handleReceivedFile(data: HttpResponse<any>) {
    const blob = new Blob([data.body], {type: FileTypes.AppXml});
    saveAs(blob, data.headers.get('x-suggested-filename'));
  }
}
