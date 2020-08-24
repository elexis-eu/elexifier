import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MessageService} from 'primeng/api';
import { DialogService, DynamicDialogConfig, DynamicDialogRef, } from 'primeng/dynamicdialog';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUpload } from 'primeng/primeng';
import { FileTypes } from '@elexifier/dictionaries/core/type/file-types.enum';
import { DataHelperService, MetadataItem } from '@elexifier/dictionaries/core/data-helper.service';
import { NEW_TRANSFORMATION_TOOLTIP_TEXT } from '@elexifier/dictionaries/components/create-dictionary-and-or-transformation-modal/create-dictionary-and-or-transformation-modal.component';

@Component({
  selector: 'app-create-dictionary',
  templateUrl: './create-dictionary.component.html',
})
export class CreateDictionaryComponent implements OnInit, AfterViewInit {
  public createDictionaryFormGroup: FormGroup;
  public dictionaryId;
  public editingField = '';
  public editingIndex = -1;

  @ViewChild('fileInput') public fileInput: FileUpload;
  @Output() public fileInputReady: EventEmitter<FileUpload>;
  public fileType: string;
  public FileTypes: typeof FileTypes = FileTypes;
  public isEdit = false;
  public metadataFields: MetadataItem[] = [];
  public NEW_TRANSFORMATION_TOOLTIP_TEXT = NEW_TRANSFORMATION_TOOLTIP_TEXT;

  @Output() public ready: EventEmitter<FormGroup>;

  @Output() public selectedFileType: EventEmitter<string>;
  public showAllFields = false;

  @Input() public showErrors: boolean;

  public constructor(
    private messageService: MessageService,
    private dictionaryApiService: DictionaryApiService,
    private fb: FormBuilder,
    private config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
  ) {
    this.ready = new EventEmitter<FormGroup>(true);
    this.fileInputReady = new EventEmitter<FileUpload>(null);
    this.selectedFileType = new EventEmitter<string>(true);
    this.isEdit = config && config.data && config.data.isEdit || null;
    this.dictionaryId = config && config.data && config.data.dictionaryId || null;
  }

  public addControlToField(field) {
    const fields = DataHelperService.getDefaultMetadataArrayItemFields(field);
    const innerFields = {};

    fields.forEach((f) => {
      innerFields[f] = this.fb.control('');
    });

    this.editingField = field;
    const array = this.createDictionaryFormGroup.get(`metaData.${ field }`) as FormArray;
    array.push(this.fb.group({...innerFields}));

    this.editingIndex = array.length - 1;
  }

  public getMetaFieldControlArray(field) {
    return this.createDictionaryFormGroup.get(`metaData.${ field }`);
  }

  public ngAfterViewInit(): void {
    this.fileInputReady.emit(this.fileInput);
  }

  public ngOnInit() {
    this.metadataFields = DataHelperService.metadata;
    const fieldControls = {};

    this.metadataFields.forEach((field) => {
      let newControl;

      switch (field.type) {
        case 'text': {
          newControl = this.fb.control('');

          break;
        }
        case 'date': {
          // TODO: Additional handling
          newControl = this.fb.control('');

          break;
        }
        case 'arrayOfObject': {
          const innerFields = {};

          field.objects.forEach((innerField) => {
            innerFields[innerField.name] = this.fb.control('');
          });

          newControl = this.fb.array([
            // this.fb.group({...innerFields}),
          ]);

          break;
        }
      }

      fieldControls[field.name] = newControl;
    });

    if (this.isEdit) {
      this.dictionaryApiService.getMetadata(this.dictionaryId)
        .subscribe((metadata) => {
          this.loadDataIntoForm(metadata);
        });
    }

    this.createDictionaryFormGroup = this.fb.group({
      fileSelected: [false, Validators.requiredTrue],
      metaData: this.fb.group({...fieldControls}),
    });

    this.ready.emit(this.createDictionaryFormGroup);
  }

  public onClickEditArrayItem(field, index) {
    if (this.editingField === field && this.editingIndex === index) {
      this.editingField = '';
      this.editingIndex = -1;
    } else {
      this.editingField = field;
      this.editingIndex = index;
    }
  }

  public onClickRemoveArrayItem(field, index) {
    const array = this.createDictionaryFormGroup.get(`metaData.${ field }`) as FormArray;

    array.removeAt(index);
  }

  public onRemoveFile() {
    this.createDictionaryFormGroup.controls.fileSelected.setValue(false);
  }

  // Only when editing metadata
  public onSave() {
    const metaData = this.createDictionaryFormGroup.get('metaData').value;

    this.dictionaryApiService.saveMetadata(this.dictionaryId, metaData)
      .subscribe((res) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Dictionary metadata successfully updated.',
        });
        this.ref.close();
      });
  }

  public onSelectFile() {
    this.fileType = this.fileInput.files[0].type;

    this.selectedFileType.emit(this.fileType);
    this.createDictionaryFormGroup.controls.fileSelected.setValue(true);
  }

  public onSendFileUploadRequest() {
    this.createDictionaryFormGroup.controls.fileSelected.setValue(false);
  }

  public toggleShowAllFields(event) {
    this.showAllFields = event;
  }

  private loadDataIntoForm(data) {
    const metaData = this.createDictionaryFormGroup.get('metaData');

    Object.keys(data).forEach((k) => {
      const field = DataHelperService.metadata.find((f) => f.name === k);

      switch (field.type) {
        case 'text': {
          metaData.get(k).patchValue(data[k]);

          break;
        }
        case 'date': {
          metaData.get(k).patchValue(data[k]);

          break;
        }
        case 'arrayOfObject': {
          const itemArray = metaData.get(k) as FormArray;

          data[k].forEach((item) => {
            itemArray.push(this.fb.group(item));
          });

          break;
        }
      }
    });
  }
}
