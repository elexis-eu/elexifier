import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SidebarStore} from '@elexifier/store/sidebar.store';
import {FormArray, FormBuilder, Validators} from '@angular/forms';
import {DictionaryApiService} from '@elexifier/dictionaries/core/dictionary-api.service';
import {WorkflowStore} from '@elexifier/store/workflow.store';
import {MessageService} from 'primeng/api';
import {switchMap} from 'rxjs/operators';

@Component({
  selector: 'app-character-mapping-page',
  templateUrl: './character-mapping-page.component.html',
  styleUrls: ['./character-mapping-page.component.scss'],
})
export class CharacterMappingPageComponent implements OnInit {
  public characterMap = this.fb.array([]);
  public dictionaryId: string;

  public constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private sidebarStore: SidebarStore,
    private dictionaryApiService: DictionaryApiService,
    private messageService: MessageService,
  ) {
    const { dictionaryId } = this.route.snapshot.params;
    this.dictionaryId = dictionaryId;
    this.sidebarStore.setDepth(dictionaryId ? 2 : 1);
  }

  public loadCharacterMapToForm(characterMap) {
    this.characterMap = this.fb.array([]);

    Object.keys(characterMap).forEach(k => {
      this.characterMap.push(this.fb.group({
        key: [k, Validators.required],
        value: [characterMap[k], Validators.required],
      }));
    });
  }

  public ngOnInit() {

    this.dictionaryApiService.getCharacterMap(this.dictionaryId)
      .subscribe((res) => {
        if (res.character_map) {
          this.loadCharacterMapToForm(res.character_map);
        }
      });
  }

  public onAddKeyPair(): void {
    const arr = this.characterMap as FormArray;

    arr.push(this.fb.group({
      key: ['', Validators.required],
      value: ['', Validators.required],
    }));
  }

  public onRemovePair(id) {
    const arr = this.characterMap as FormArray;

    arr.removeAt(id);
  }

  public onSaveKeyPairs(): void {
    const formattedObject = {
      character_map: {},
    };

    this.characterMap.value.forEach(k => {
      if (k.key !== '' && k.value !== '') {
        formattedObject.character_map[k.key] = k.value;
      }
    });

    this.dictionaryApiService.setCharacterMap(this.dictionaryId, formattedObject)
      .pipe(
        switchMap((res) => {
          if (res.msg === 'ok') {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Successfully added character map',
            });
          }
          return this.dictionaryApiService.getCharacterMap(this.dictionaryId);
        }),
      )
      .subscribe((res) => {
        this.loadCharacterMapToForm(res.character_map);
      });
  }
}
