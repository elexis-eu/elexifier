import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { Subject, timer } from 'rxjs';
import { startWith, switchMap, take, takeUntil } from 'rxjs/operators';
import {FileTypes} from '@elexifier/dictionaries/core/type/file-types.enum';
import {MessageService} from 'primeng/api';
import { saveAs } from 'file-saver';

enum PdfStatuses {
  Lex2MlError= 'Lex2ML_Error',
  LexFormat = 'Lex_Format',
  LexonomyAnnotated = 'Lexonomy_Annotated',
  PreviewLexonomyError = 'preview_Lexonomy_Error',
  AnnotateLexonomyError = 'annotate_Lexonomy_Error',
  Ml2LexError = 'ML2Lex_Error',
  MlAnnotated = 'ML_Annotated',
  MlError = 'ML_Error',
  MlFormat = 'ML_Format',
  AnnotateStarting = 'annotate_Starting',
  AnnotateReady = 'annotate_Ready',
  AnnotateProcessing = 'annotate_Processing',
  PreviewStarting = 'preview_Starting',
  PreviewReady = 'preview_Ready',
  PreviewProcessing = 'preview_Processing',
  StartingMl = 'Starting_ML',
}

@Component({
  selector: 'app-pdf-workflow-options',
  templateUrl: './pdf-workflow-options.component.html',
})
export class PdfWorkflowOptionsComponent implements OnInit, OnDestroy, OnChanges {
  public annotateUrl: string;
  @Input() public dictionaryId: string;
  public downloadUrl: string;
  public PdfStatuses: typeof PdfStatuses = PdfStatuses;
  public previewUrl: string;
  public status: PdfStatuses;
  public preparingDownload = false;

  private readonly destroy$: Subject<number>;
  private readonly pollingInterval: number;
  private readonly timer$: Subject<number>;

  public constructor(
    private readonly dictionaryApiService: DictionaryApiService,
    private readonly messageService: MessageService,
  ) {
    this.pollingInterval = 15000;
    this.destroy$ = new Subject();
    this.timer$ = new Subject();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    this.askForStatusUpdate();
  }

  public ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public ngOnInit() {
    this.timer$
      .pipe(
        startWith(null),
        switchMap(() => timer(0, this.pollingInterval)),
        switchMap(() => this.dictionaryApiService.getPdfWorkflowStatusByDictionary(this.dictionaryId)),
        takeUntil(this.destroy$),
      )
      .subscribe(res => this.setTemplateValuesFromStatusResponse(res));
  }

  public onOpenPreviewClick(): void {

    this.dictionaryApiService.startPreviewProcess(this.dictionaryId)
      .pipe(take(1))
      .subscribe(() => this.askForStatusUpdate());
  }

  public sendAdditionalPages(): void {
    this.dictionaryApiService.startAnnotateProcess(this.dictionaryId, true)
      .subscribe((res) => {
        this.askForStatusUpdate();
      });
  }

  public onStartAnnotateProcessClick(): void {
    if (window.confirm('Are you sure?')) {
      this.dictionaryApiService.startAnnotateProcess(this.dictionaryId)
        .pipe(take(1))
        .subscribe(() => {
          this.askForStatusUpdate();
        });
    }
  }

  public onTriggerMlWorkflowClick(): void {
    this.dictionaryApiService.triggerMlWorkflow(this.dictionaryId)
      .pipe(take(1))
      .subscribe(() => this.askForStatusUpdate());
  }

  private askForStatusUpdate(): void {
    this.timer$.next();
  }

  private setTemplateValuesFromStatusResponse(res): void {
    this.status = res.status;

    this.annotateUrl = res.lexonomy_edit;
    this.previewUrl = res.lexonomy_ml_edit;
    this.downloadUrl = res.xml_ml_out;
  }

  public isAnnotateDisabled() {
    return (this.status === PdfStatuses.AnnotateStarting || this.status === PdfStatuses.AnnotateProcessing);
  }

  public isPreviewDisabled() {
    return (this.status === PdfStatuses.PreviewStarting || this.status === PdfStatuses.PreviewProcessing);
  }

  public onDownloadPdf() {
    this.preparingDownload = true;

    this.dictionaryApiService.downloadTransformedPdf(this.dictionaryId)
      .subscribe((res) => {
        this.preparingDownload = false;
        const blob = new Blob([res.body], {type: FileTypes.AppXml});
        saveAs(blob, res.headers.get('x-suggested-filename'));
      }, err => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error downloading selected file. Try again later.',
        });
      });
  }

  public canDownload() {
    return (this.status === PdfStatuses.LexFormat || this.status === PdfStatuses.PreviewReady);
  }
}
