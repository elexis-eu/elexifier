import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { of, Subject, timer } from 'rxjs';
import { delay, expand, map, retryWhen, startWith, switchMap, take, takeUntil, takeWhile } from 'rxjs/operators';
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

enum PdfAnnotateStatus {
  Starting = 'Starting',
  Processing = 'Processing',
  LexonomyError = 'Lexonomy_Error',
  Ready = 'Ready',
}

enum PdfMLStatus {
  StartingML = 'Starting_ML',
  Lex2MlError = 'Lex2ML_Error',
  MlFormat = 'ML_Format',
  MlError = 'ML_Error',
  MlAnnotated = 'ML_Annotated',
  Ml2LexError = 'ML2Lex_Error',
  LexFormat = 'Lex_Format',
}

enum PdfPreviewStatus {
  Starting = 'Starting',
  Processing = 'Processing',
  LexonomyError = 'Lexonomy_Error',
  Ready = 'Ready',
}

enum PdfDownloadStatus {
  PreparingDownload = 'Preparing_download',
  Ready = 'Ready',
}

@Component({
  selector: 'app-pdf-workflow-options',
  templateUrl: './pdf-workflow-options.component.html',
})
export class PdfWorkflowOptionsComponent implements OnInit, OnDestroy, OnChanges {
  public annotateUrl: string;
  @Input() public dictionaryId: string;
  public downloadUrl: string;

  public PdfAnnotateStatus = PdfAnnotateStatus;
  public PdfDownloadStatus = PdfDownloadStatus;
  public PdfMLStatus = PdfMLStatus;
  public PdfPreviewStatus = PdfPreviewStatus;

  public PdfStatuses: typeof PdfStatuses = PdfStatuses;
  public preparingDownload = false;
  public previewUrl: string;
  public status: { annotate: string, download: string, ml: null, preview: null };

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

  public canDownload() {
    return (this.status?.ml === PdfMLStatus.LexFormat || this.status?.preview === PdfPreviewStatus.Ready);
  }

  public isAnnotateDisabled() {
    return (this.status?.annotate === PdfAnnotateStatus.Starting || this.status?.annotate === PdfAnnotateStatus.Processing);
  }

  public isPreviewDisabled() {
    return (this.status?.preview === PdfPreviewStatus.Starting || this.status?.preview === PdfPreviewStatus.Processing);
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

  public onDownloadPdf() {
    this.preparingDownload = true;
    this.messageService.add({
      severity: 'warn',
      summary: 'Download preparation started',
      detail: 'This process may take up to 1 minute',
      life: 10000,
    });
    const req =  this.dictionaryApiService.downloadTransformedPdf(this.dictionaryId).pipe(map((res) => {
      let isFile = false;

      try {
        JSON.parse(res.body);
      } catch (e) {
        isFile = true;
      }
      return {isFile, res};
    }));

    req.pipe(
      expand(({isFile, res}) => {
        return isFile ? of() : req.pipe(delay(5000));
      })).subscribe(({isFile, res}) => {
        if (res && isFile) {
          this.preparingDownload = false;
          const blob = new Blob([res.body], {type: FileTypes.AppXml});
          saveAs(blob, res.headers.get('x-suggested-filename'));
        }
      }, err => {
      this.preparingDownload = false;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error downloading selected file. Try again later.',
      });
    });
  }

  public onOpenPreviewClick(): void {

    this.dictionaryApiService.startPreviewProcess(this.dictionaryId)
      .pipe(take(1))
      .subscribe(() => this.askForStatusUpdate());
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

  public sendAdditionalPages(): void {
    this.dictionaryApiService.startAnnotateProcess(this.dictionaryId, true)
      .subscribe((res) => {
        this.askForStatusUpdate();
      });
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
}
