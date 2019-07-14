import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { Subject, timer } from 'rxjs';
import { startWith, switchMap, take, takeUntil } from 'rxjs/operators';

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

  private readonly destroy$: Subject<number>;
  private readonly pollingInterval: number;
  private readonly timer$: Subject<number>;

  public constructor(
    private readonly dictionaryApiService: DictionaryApiService,
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
}
