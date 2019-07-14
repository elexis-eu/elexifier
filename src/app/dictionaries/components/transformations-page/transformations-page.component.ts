import { Component, OnDestroy, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { TransformationService } from '@elexifier/dictionaries/core/transformation.service';
import { HighlightService } from '@elexifier/dictionaries/core/highlight.service';
import { XmlPrettifierPipe } from '@elexifier/dictionaries/shared/xml-prettifier.pipe';
import { TransformationApiService } from '@elexifier/dictionaries/core/transformation-api.service';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { SidebarStore } from '@elexifier/store/sidebar.store';
import { FullpageLoaderStore } from '@elexifier/store/fullpage-loader.store';
import { WorkflowStore } from '@elexifier/store/workflow.store';

@Component({
  selector: 'app-transformations-page',
  templateUrl: './transformations-page.component.html',
  styleUrls: ['./transformations-page.component.scss'],
})
export class TransformationsPageComponent implements OnInit, OnDestroy {

  get transformation() {
    return this.transformationService.transformation;
  }

  public fixedTree = false;

  public highlightedInput;
  public highlightedOutput;

  public isEdit = false;

  public loading = {
    headwords: true,
    originalXml: true,
    outputTei: true,
  };
  public menuDepth: number;

  public stripSettings = {
    namespaces: false,
    teiHeader: false,
    dictScrap: false,
  };

  public unsubscribe$ = new Subject<any>();

  public constructor(
    private route: ActivatedRoute,
    public transformationService: TransformationService,
    private highlightService: HighlightService,
    private xmlPrettierPipe: XmlPrettifierPipe,
    private router: Router,
    private messageService: MessageService,
    private transformationApiService: TransformationApiService,
    private sidebarStore: SidebarStore,
    private fullpageLoader: FullpageLoaderStore,
    public workflowStore: WorkflowStore,
  ) {}

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    this.highlightService.clearOutputs();
  }

  public ngOnInit() {
    this.isEdit = !!this.route.snapshot.url.find(s => s.path === 'edit');
    this.stripSettings = this.workflowStore.stripSettings;

    if (this.isEdit) {
      this.sidebarStore.setDepth(4);
    } else {
      this.sidebarStore.setDepth(2);
    }

    this.sidebarStore.depth.pipe(
      takeUntil(this.unsubscribe$),
    ).subscribe(depth => this.menuDepth = depth);

    this.route.params.subscribe((res) => {
      const { transformId } = res;
      this.transformationApiService.getTransformationById(transformId)
        .subscribe(transformRes => this.handleReceivedTransformation(transformRes));
    });

    this.workflowStore.selectedHeadword$.pipe(
      takeUntil(this.unsubscribe$),
      map((selectedHeadword: any) => {
        if (selectedHeadword) {
          this.fullpageLoader.loading = false;

          const {
            transformId,
          } = this.route.snapshot.params;

          this.applyTransformation(transformId,
            this.workflowStore.selectedHeadword ? this.workflowStore.selectedHeadword.id : selectedHeadword.id);
        }
      })).subscribe();
  }

  public onChangeAnchor(anchor) {
    this.fixedTree = anchor;
  }

  public onChangeStripSettings(): void {
    this.workflowStore.stripSettings = this.stripSettings;
    const {
      transformId,
    } = this.route.snapshot.params;

    const firstHeadwordId = this.workflowStore.selectedTransformation.entities[0].id;
    this.applyTransformation(
      transformId,
      this.workflowStore.selectedHeadword ? this.workflowStore.selectedHeadword.id : firstHeadwordId);
  }

  private applyTransformation(transformId, headwordId): void {
    this.transformationApiService.applyTransformation(transformId, headwordId, this.workflowStore.stripSettings)
      .subscribe((appliedTransformation) => {
        this.loading.outputTei = false;
        this.loading.originalXml = false;

        this.highlightXmlFields(appliedTransformation.entity_xml, appliedTransformation.output);
      });
  }

  private handleReceivedTransformation(transformationResponse) {
    this.fullpageLoader.loading = false;

    if (transformationResponse && transformationResponse.entities.length > 0) {
      this.loading.outputTei = true;
      this.loading.originalXml = true;

      this.workflowStore.selectedTransformation = {
        transformation: transformationResponse.transform[0],
        entities: transformationResponse.entities,
      };

      this.workflowStore.selectedHeadword =
        this.workflowStore.selectedHeadword || this.workflowStore.selectedTransformation.entities[0];
    } else {
      this.loading.outputTei = false;
      this.loading.originalXml = false;

      setTimeout(() => {
        this.highlightXmlFields(null, null);
        // Currently highlight service not in use
        this.highlightService.clearOutputs();
      }, 100);
    }
  }

  private highlightXmlFields(originalXml: string, outputTei: string) {
    this.highlightedInput = originalXml;
    this.highlightedOutput = outputTei;
  }
}
