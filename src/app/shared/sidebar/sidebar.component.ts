import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '@elexifier/core/auth.service';
import { debounceTime, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { Dictionary } from '@elexifier/dictionaries/core/type/dictionary.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { TransformationService } from '@elexifier/dictionaries/core/transformation.service';
import { Headword } from '@elexifier/dictionaries/core/type/headword.interface';
import { SidebarStore } from '@elexifier/store/sidebar.store';
import { DialogService, MessageService } from 'primeng/api';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { AddDictionaryOrTransformationService } from '@elexifier/dictionaries/core/add-dictionary-or-transformation.service';
import { HighlightService } from '@elexifier/dictionaries/core/highlight.service';
import { TransformationApiService } from '@elexifier/dictionaries/core/transformation-api.service';
import { FileTypes } from '@elexifier/dictionaries/core/type/file-types.enum';
import { DownloadTransformationComponent } from '@elexifier/dictionaries/components/download-transformation/download-transformation.component';
import { FullpageLoaderStore } from '@elexifier/store/fullpage-loader.store';
import { WorkflowStore } from '@elexifier/store/workflow.store';
import {PseudoAttributes} from '@elexifier/dictionaries/core/type/pseudo-attributes.enum';
import {UserStore} from '@elexifier/store/user.store';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
  public dictionaries: Dictionary[];
  public dictionarySearchString = '';
  public filteredDictionaries: Dictionary[];
  public filteredHeadwords: Headword[] = [];
  public headwordSearch$ = new BehaviorSubject<string>('');
  public headwordSearchString = '';

  public loading = {
    dictionaries: true,
    transformations: true,
    headwords: true,
    outputTei: false,
    originalXml: false,
  };

  public menuDepth: number;
  public selectedDictionaryIndex: number;
  public selectedHeadwordId: number;
  public selectedTransformationId: number;
  public transformations = [];

  public userMenuItems = [{
    label: 'Logout',
    icon: 'pi pi-sign-out',
    command: () => {
      this.authService.logout();
    },
  }];

  private selectedDictionaryDatabaseIndex: number;
  private unsubscribe$ = new Subject<any>();

  public constructor(
    private authService: AuthService,
    private router: Router,
    private transformationService: TransformationService,
    private route: ActivatedRoute,
    private sidebarStore: SidebarStore,
    private dictionaryApiService: DictionaryApiService,
    private addDictionaryOrTransformationService: AddDictionaryOrTransformationService,
    private highlightService: HighlightService,
    private messageService: MessageService,
    private transformationApiService: TransformationApiService,
    private dialogService: DialogService,
    public fullpageLoaderService: FullpageLoaderStore,
    public workflowStore: WorkflowStore,
    public userStore: UserStore,
  ) {}

  public filterColumn(array, value, targetArray, propertyToCheck) {
    const regexp = new RegExp(value, 'i');
    this[targetArray] = this[array].filter(o => regexp.test(o[propertyToCheck]));
  }

  public filterHeadwords(value) {
    this.headwordSearch$.next(value);
  }

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public ngOnInit(): void {
    let hwSearchSub;
    this.sidebarStore.depth.pipe(
      takeUntil(this.unsubscribe$),
      )
      .subscribe((menuDepth) => {
        const {
          dictionaryId,
          transformId,
        } = this.route.firstChild.snapshot.params;

        this.menuDepth = menuDepth;

        // Clearing headword search
        this.headwordSearchString = '';
        this.filterHeadwords(this.headwordSearchString);
        if (this.menuDepth === 4) {
          hwSearchSub = this.headwordSearch$.pipe(
            takeUntil(this.unsubscribe$),
            debounceTime(350),
            switchMap((value) => {
              this.loading.headwords = true;
              return this.transformationApiService.filterHeadwords(
                this.workflowStore.selectedTransformation
                  ? this.workflowStore.selectedTransformation.transformation.id
                  : transformId,
                this.workflowStore.selectedDictionary ? this.workflowStore.selectedDictionary.id : dictionaryId,
                value);
            }),
          ).subscribe((res) => {
            this.filteredHeadwords = res.result;
            this.loading.headwords = false;
          });
        } else {
          if (hwSearchSub) {
            hwSearchSub.unsubscribe();
          }
        }
      });

    this.route.params.pipe(
      switchMap((params) => {
        this.workflowStore.type = params.workflowType;
        const isPdfWorkflow = this.workflowStore.type === 'pdf';
        this.transformations = [];
        this.filteredHeadwords = [];
        return this.dictionaryApiService.getDictionaries(isPdfWorkflow ? 'pdf' : '');
      }),
      switchMap((dictionaries) => {
        this.dictionaries = dictionaries;
        this.filteredDictionaries = this.dictionaries;

        this.loading.dictionaries = false;

        if (dictionaries.length > 0) {
          // TODO: Consider this insted of fixed dictionary ID
          const {
            dictionaryId: dId,
            transformId: tId,
          } = this.route.firstChild.snapshot.params;

          this.selectedDictionaryIndex = dId ? this.dictionaries.map(d => d.id)
            .indexOf(Number(dId)) : 0;

          this.workflowStore.selectedDictionary = this.dictionaries[this.selectedDictionaryIndex];
          const mimeType = this.dictionaries[this.selectedDictionaryIndex].upload_mimetype;
          if (mimeType === FileTypes.AppXml || mimeType === FileTypes.TextXml) {
            // In case this is an XML workflow, we load the transformations
            this.workflowStore.type = 'xml';
            return this.transformationApiService
              .getTransformationsByDictionaryId(this.workflowStore.selectedDictionary.id);
          }
        }

        // If it is a pdf workflow we skip getting the transformations as we only need to provide dictionary controls
        this.workflowStore.type = 'pdf';
        return of(false);
      }),
      switchMap((transformations) => {
        const {
          transformId,
        } = this.route.firstChild.snapshot.params;

        if (transformations) {
          // This is a normal xml workflow
          this.transformations = transformations;
          this.loading.transformations = false;

          if (transformations.length > 0) {
            this.selectedTransformationId =
              transformId ? this.transformations.map(d => d.id)
                .indexOf(Number(transformId)) : 0;

            if (transformId) {
              return this.transformationApiService.getTransformationById(transformId);
            }

            return of(false);
          }
        } else {
          // This is a pdf workflow now
          return of(false);
        }
      }),
      map((selectedTransformation: any) => {
        if (selectedTransformation) {
          this.workflowStore.selectedTransformation = {
            transformation: selectedTransformation.transform[0],
            entities: selectedTransformation.entities,
          };
        }
      }),
      )
      .subscribe();
  }

  public onClickEditTransformation() {
    this.fullpageLoaderService.loading = true;

    setTimeout(() => {
      this.router
        .navigate([
          'dictionaries',
          this.workflowStore.type,
          this.dictionaries[this.selectedDictionaryIndex].id,
          'transformations',
          this.transformations[this.selectedTransformationId].id,
          'edit',
        ]);
    }, 100);
  }

  public onDeleteDictionaryClick(dictionaryId): void {
    this.dictionaryApiService.deleteDictionary(dictionaryId)
      .pipe(
        tap(() => {
          this.dictionaries.splice(this.selectedDictionaryIndex, 1);
          this.transformations = [];
          this.selectedDictionaryIndex = null;
          this.router.navigate(['dictionaries']);
        }),
      )
      .subscribe(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Dictionary successfully deleted.',
        });
      });
  }

  public onEditMetadataClick(dictionaryId): void {
    this.openMetadataEditModal(dictionaryId);
  }

  public onDeleteTransformationClick(transformationId): void {
    this.transformationApiService
      .deleteTransformation(transformationId, this.selectedDictionaryDatabaseIndex)
      .subscribe((res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Transformation successfully deleted',
          });
          const transformationListIndex = this.transformations.map(t => t.id)
            .indexOf(transformationId);
          this.transformations.splice(transformationListIndex, 1);

          if (this.transformations.length > 0) {
            this.onSelectTransformation(transformationListIndex);
          }
        }
      });
  }


  public onDownloadTransformation() {

    const modalRef = this.dialogService.open(DownloadTransformationComponent, {
      header: `Download transformation`,
      width: '45%',
      styleClass: 'upload-dictionary-modal',
      showHeader: false,
    });

    modalRef.onClose.subscribe((res) => {});
  }

  public onResetTransform(transformationDatabaseIndex): void {
    const transformationListIndex = this.transformations.map(t => t.id)
      .indexOf(transformationDatabaseIndex);
    const transformation = this.transformations[transformationListIndex];

    const dummyHw = {
      selector: {
        expr: 'dummy',
        type: 'xpath',
      },
      type: 'simple',
      attr: PseudoAttributes.ElementInnerText,
    };

    const newTransform = {
      entry: {
        expr: 'dummy',
        type: 'xpath',
      },
      sense: {
        expr: 'dummy',
        type: 'xpath',
      },
      hw: this.transformationService.transformation && this.transformationService.transformation.hw
        ? this.transformationService.transformation.hw : dummyHw,
    };

    const newSpec = {
      xfspec: this.transformationService.prependSelectorsRelatively(newTransform),
    };

    this.transformationApiService
      .patchTransformation(transformation.id, newSpec)
      .pipe(
        tap(() => {
          // TODO: API should return the updated transformation
          this.onSelectTransformation(transformationListIndex);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Transformation successfully reset',
          });
        }
      });
  }

  public onSelectDictionary(index) {
    this.selectedDictionaryIndex = index;
    this.selectedDictionaryDatabaseIndex = this.dictionaries[index].id;
    this.loading.transformations = true;

    this.workflowStore.selectedHeadword = null;
    this.workflowStore.selectedDictionary = this.dictionaries[this.selectedDictionaryIndex];

    this.transformationApiService.getTransformationsByDictionaryId(this.selectedDictionaryDatabaseIndex)
      .subscribe((transformations) => {
        this.loading.transformations = false;
        this.transformations = transformations;
        this.selectedTransformationId = 0;

        const routerPath = [
          'dictionaries',
          this.workflowStore.type,
          this.selectedDictionaryDatabaseIndex,
        ];

        if (this.workflowStore.type === 'xml' && transformations.length > 0) {
          this.router
            .navigate([
              ...routerPath,
              'transformations',
              this.transformations[0].id,
            ]);
        } else {
          this.router
            .navigate(routerPath);
        }
      });
  }

  public onSelectHeadword(databaseIndex) {
    this.selectedHeadwordId = this.filteredHeadwords.map(h => h.id)
      .indexOf(databaseIndex);
    this.workflowStore.selectedHeadword = this.filteredHeadwords[this.selectedHeadwordId];
  }

  public onSelectTransformation(index) {
    const selectedTransformationDatabaseIndex = this.transformations[index].id;

    if (!this.workflowStore.selectedTransformation || selectedTransformationDatabaseIndex !== this.workflowStore.selectedTransformation.id) {
      this.headwordSearchString = '';
      this.selectedTransformationId = index;

      this.filteredHeadwords = [];
      const isEdit = this.route.firstChild.snapshot.url.find(s => s.path === 'edit');

      const routerPath = [
        'dictionaries',
        this.workflowStore.type,
        this.workflowStore.selectedDictionary.id,
        'transformations',
        this.transformations[index].id,
      ];

      if (isEdit) {
        this.router
          .navigate([
            ...routerPath,
            'edit',
          ]);
      } else {
        this.router
          .navigate([...routerPath]);
      }
    }
  }

  public openCreateDictionaryAndTransformationModal() {
    const ref = this.addDictionaryOrTransformationService.openCreateDictionaryAndTransformationModal();
    ref.onClose
      .pipe(
        take(1),
        switchMap((data) => {
          if (data) {
            return this.dictionaryApiService.getDictionaries(this.workflowStore.type);
          }

          return of(false);
        }),
        switchMap((dictionaries: any) => {
          if (dictionaries) {
            this.dictionaries = dictionaries;
            this.filteredDictionaries = dictionaries;
            this.selectedDictionaryIndex = 0;
            this.workflowStore.selectedDictionary = this.dictionaries[0];

            if (this.workflowStore.type === 'xml') {
              return this.transformationApiService.getTransformationsByDictionaryId(this.dictionaries[0].id);
            }

            return of(false);
          }
        }),
        map((transformations) => {
          if (transformations) {
            this.transformations = transformations;
            this.loading.transformations = false;

            if (transformations.length > 0) {
              this.onSelectTransformation(0);
            }
          }
        }))
      .subscribe();
  }

  public openCreateTransformationModal(dictionaryId) {
    const ref = this.addDictionaryOrTransformationService.openCreateTransformationModal(dictionaryId);
    ref.onClose
      .pipe(
        take(1),
        switchMap((data) => {
          if (data) {
            return this.transformationApiService.getTransformationsByDictionaryId(dictionaryId);
          }

          return of(false);
        }),
        map((transformations: any) => {
          if (transformations) {
            // This is a normal xml workflow
            this.transformations = transformations;
            this.loading.transformations = false;

            this.onSelectTransformation(0);
          }
        }))
      .subscribe();
  }

  public openMetadataEditModal(dictionaryId) {
    const ref = this.addDictionaryOrTransformationService.openEditDictionaryMetadataModal(dictionaryId);
  }

  public resetList(array, originalArray) {
    this[array] = this[originalArray];
  }
}
