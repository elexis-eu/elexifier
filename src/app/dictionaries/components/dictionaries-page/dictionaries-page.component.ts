import { Component, OnDestroy, OnInit } from '@angular/core';
import { Dictionary } from '@elexifier/dictionaries/core/type/dictionary.interface';
import { Subject } from 'rxjs';
import { AuthenticatedUser } from '@elexifier/shared/type/authenticated-user.interface';
import { SidebarStore } from '@elexifier/store/sidebar.store';
import { AddDictionaryOrTransformationService } from '@elexifier/dictionaries/core/add-dictionary-or-transformation.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { ClarinPullModalService } from '@elexifier/dictionaries/components/clarin-pull-modal/clarin-pull-modal.service';

enum WorkflowType {
  Pdf = 'pdf',
  Xml = 'xml',
}

@Component({
  selector: 'app-dictionaries-page',
  templateUrl: './dictionaries-page.component.html',
  styleUrls: ['./dictionaries-page.component.scss'],
})
export class DictionariesPageComponent implements OnInit, OnDestroy {
  public dictionaries: Dictionary[] = [];
  public lexonomyUrl: string;
  public transformations = [];
  public user: AuthenticatedUser;
  public workflowType: string;
  private unsubscribe$ = new Subject<any>();

  public constructor(
    private readonly sidebarStore: SidebarStore,
    private readonly addDictionaryOrTransformationService: AddDictionaryOrTransformationService,
    private readonly dictionaryApiService: DictionaryApiService,
    private readonly route: ActivatedRoute,
    private readonly clarinPullModalService: ClarinPullModalService,
  ) {}

  public ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  public ngOnInit() {
    const { dictionaryId } = this.route.snapshot.params;
    this.sidebarStore.setDepth(dictionaryId ? 2 : 1);

    this.route.params
      .pipe(
        takeUntil(this.unsubscribe$),
      )
      .subscribe(({ workflowType }) => {
        this.workflowType = workflowType;
      });
  }

  public openPullClarinModal() {
    this.clarinPullModalService.openClarinPullModal();
  }

  public openCreateDictionaryAndTransformationModal() {
    this.addDictionaryOrTransformationService.openCreateDictionaryAndTransformationModal();
  }
}
