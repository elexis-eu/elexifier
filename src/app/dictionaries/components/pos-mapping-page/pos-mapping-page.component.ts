import { Component, OnInit } from '@angular/core';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { ActivatedRoute } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, Validators } from '@angular/forms';
import { SidebarStore } from '@elexifier/store/sidebar.store';
import { DataHelperService } from '@elexifier/dictionaries/core/data-helper.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-pos-mapping-page',
  templateUrl: './pos-mapping-page.component.html',
  styleUrls: ['./pos-mapping-page.component.scss'],
})
export class PosMappingPageComponent implements OnInit {
  public dictionaryId: string;
  public posMap = this.fb.array([]);
  public loadingPosMap = false;

  public constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private sidebarStore: SidebarStore,
    private messageService: MessageService,
    private readonly dictionaryApiService: DictionaryApiService,
  ) {
    const { dictionaryId } = this.route.snapshot.params;
    this.dictionaryId = dictionaryId;
    this.sidebarStore.setDepth(dictionaryId ? 2 : 1);
  }

  public applyPOSElementToMap(control: AbstractControl, value) {
    const currentValue = control.value;
    control.setValue({
      key: currentValue.key,
      value,
    });
    control.markAsDirty();
  }
  public getPOSElementList() {
    // return DataHelperService.partOfSpeechElementList.filter(e => !this.posMap.value.some(m => m.value === e));
    return DataHelperService.partOfSpeechElementList;
  }

  public loadPosMap(refresh = false): void {
    this.loadingPosMap = true;
    this.dictionaryApiService.getPOSMap(this.dictionaryId, refresh).subscribe((data) => {
      this.loadPosMapToForm(data.pos_map);
      this.loadingPosMap = false;
    });
  }

  public loadPosMapToForm(characterMap) {
    this.posMap = this.fb.array([]);

    Object.keys(characterMap).forEach(k => {
      this.posMap.push(this.fb.group({
        key: [k, Validators.required],
        value: [characterMap[k], Validators.required],
      }));
    });
  }

  public ngOnInit(): void {
    this.loadPosMap();
  }

  public savePosMap() {
    const formattedObject = {
      pos_map: {},
    };

    this.posMap.value.forEach(k => {
      if (k.key !== '' && k.value !== '') {
        formattedObject.pos_map[k.key] = k.value;
      }
    });

    this.dictionaryApiService.setPOSMap(this.dictionaryId, formattedObject)
      .subscribe((res) => {
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Successfully updated POS map',
      });

      this.posMap.markAsPristine()
    });
  }
}
