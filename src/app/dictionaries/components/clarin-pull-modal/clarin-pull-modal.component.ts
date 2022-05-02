import { Component, OnInit } from '@angular/core';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { FormArray, FormBuilder, FormControl } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MessageService } from 'primeng/api';
import { catchError, map } from 'rxjs/operators';

@Component({
  selector: 'app-clarin-pull-modal',
  templateUrl: './clarin-pull-modal.component.html',
  styleUrls: ['./clarin-pull-modal.component.scss'],
})
export class ClarinPullModalComponent implements OnInit {
  public availableFiles: string[] = [];
  public clarinPullUrl: string;
  public form = this.fb.group({
    handle: [''],
    files: new FormArray([]),
    acronym: 'CLRN'
  });
  public loadingDictionary: boolean;
  public loadingFiles: boolean;

  public constructor(
    private readonly dictionaryApiService: DictionaryApiService,
    private readonly fb: FormBuilder,
    public readonly ref: DynamicDialogRef,
    private readonly messageService: MessageService,
  ) { }

  public isChecked(value: any) {
    const formArray: FormArray = this.form.get('files') as FormArray;

    return formArray.controls.find((ctrl: FormControl) => {
      if (ctrl.value === value) {
        return true;
      }
    });
  }

  public ngOnInit() {}

  public onFileCheckChange(event) {
    const formArray: FormArray = this.form.get('files') as FormArray;

    if (event.target.checked) {
      // Add a new control in the arrayForm
      formArray.push(new FormControl(event.target.value));
    } else {
      // find the unselected element
      let i = 0;

      formArray.controls.forEach((ctrl: FormControl) => {
        if (ctrl.value === event.target.value) {
          // Remove the unselected element from the arrayForm
          formArray.removeAt(i);
          return;
        }

        i++;
      });
    }
  }

  // https://hdl.handle.net/11356/1475
  public pullClarinDictionary() {
    this.loadingDictionary = true;

    this.dictionaryApiService.pullClarinDictionary(this.form.get('handle').value).pipe(
      catchError((error) => {
        this.loadingDictionary = false;

        return [];
      }),
    ).subscribe((data) => {
        this.availableFiles = data.found;
        this.form.get('handle').disable();
        this.loadingDictionary = false;
    });
  }

  public pullClarinFiles() {
    this.loadingFiles = true;

    this.dictionaryApiService
      .pullClarinDictionaryFiles(
        this.form.get('handle').value,
        this.form.get('files').value,
        this.form.get('acronym').value,
      ).pipe(
      catchError((error) => {
        this.loadingDictionary = false;

        return [];
      }),
    ).subscribe((data) => {
      this.loadingFiles = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Successfully loaded files',
      });
      this.ref.close();
    });
  }

  public toggleAllFiles() {
    const formArray: FormArray = this.form.get('files') as FormArray;

    if (formArray.value.length) {
      while (formArray.length !== 0) {
        formArray.removeAt(0);
      }
    } else {
      this.availableFiles.forEach((file) => {
        formArray.push(new FormControl(file));
      });
    }
  }
}
