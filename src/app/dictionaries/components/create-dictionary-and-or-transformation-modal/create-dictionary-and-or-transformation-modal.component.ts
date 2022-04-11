import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TransformationApiService } from '@elexifier/dictionaries/core/transformation-api.service';
import { FileUpload } from 'primeng/primeng';
import { UploadService } from '@elexifier/dictionaries/core/upload.service';
import { FileUploadEvents } from '@elexifier/dictionaries/core/type/file-upload-events.enum';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { Transformation } from '@elexifier/dictionaries/core/type/transformation.interface';
import { CreateTransformation } from '@elexifier/dictionaries/core/type/create-transformation.interface';
import { PseudoAttributes } from '@elexifier/dictionaries/core/type/pseudo-attributes.enum';
import { of } from 'rxjs';
import { Router } from '@angular/router';
import { WorkflowStore } from '@elexifier/store/workflow.store';
import { FileTypes } from '@elexifier/dictionaries/core/type/file-types.enum';

export const NEW_TRANSFORMATION_TOOLTIP_TEXT = `Define the basic parameters of the XML transformation into the
  Elexis Data Model. You will be able to customize the transformation details later.`;

@Component({
  selector: 'app-create-dictionary-and-or-transformation-modal',
  templateUrl: './create-dictionary-and-or-transformation-modal.component.html',
})
export class CreateDictionaryAndOrTransformationModalComponent implements OnInit {
  public dictionaryAndOrTransformationFormGroup: FormGroup;
  public dictionaryId: number;
  public fileType: string;
  public FileTypes: typeof FileTypes = FileTypes;
  public NEW_TRANSFORMATION_TOOLTIP_TEXT = NEW_TRANSFORMATION_TOOLTIP_TEXT;
  public progressPercentage: number;
  public showErrors: boolean;
  public UPLOAD_A_DICTIONARY_TOOLTIP_TEXT = 'Upload your dictionary file in either XML or PDF format.';
  public uploadInProgress = false;
  private fileInput: FileUpload;
  private newTransformation: CreateTransformation;

  public constructor(
    public config: DynamicDialogConfig,
    public ref: DynamicDialogRef,
    private dictionaryApiService: DictionaryApiService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    private transformationApiService: TransformationApiService,
    private uploadService: UploadService,
    public workflowStore: WorkflowStore,
  ) {
    this.dictionaryId = config && config.data && config.data.dictionaryId || null;
    this.progressPercentage = 0;
  }

  public getInitializedTransformation(transformationFormValue: CreateTransformation): { xfspec?: Transformation; } {
    const transformationPatchData: { xfspec?: Transformation } = {
      /**
       * TODO:
       * This object is sent out to initialize the transformation.
       * This should be done on the backend when the transformation is created.
       */
      xfspec: {},
    };

    // Add entry element if present in the form
    if (transformationFormValue.entry_spec) {
      transformationPatchData.xfspec.entry = {
        expr: `.//${transformationFormValue.entry_spec}`,
        type: 'xpath',
      };
    } else {
      transformationPatchData.xfspec.entry = {
        expr: 'dummy',
        type: 'xpath',
      };
    }

    // Add entry language element
    transformationPatchData.xfspec.entry_lang = {
      attr: PseudoAttributes.Constant,
      const: '',
      selector: transformationPatchData.xfspec.entry,
      type: 'simple',
    };

    // TODO: Currently there is no available field for 'sense' property on the frontend
    if (transformationFormValue.sense) {
      transformationPatchData.xfspec.entry = {
        expr: transformationFormValue.sense,
        type: 'xpath',
      };
    } else {
      transformationPatchData.xfspec.sense = {
        expr: 'dummy',
        type: 'xpath',
      };
    }

    // Add headword element if present in the form
    if (transformationFormValue.hw && transformationFormValue.hw.length > 0) {
      transformationPatchData.xfspec.hw = {
        attr: PseudoAttributes.ElementInnerText,
        type: 'simple',
        selector: {
          expr: `.//${transformationFormValue.hw}`,
          type: 'xpath',
        },
      };
    }

    return transformationPatchData;
  }

  public ngOnInit() {
    this.dictionaryAndOrTransformationFormGroup = this.fb.group({});
  }

  public onCreateClick() {
    /**
     * Validation only for XML files
     * TODO: Toggle validation inside create-transformation-component.ts
     */
    if (this.dictionaryAndOrTransformationFormGroup.invalid && this.fileType !== FileTypes.AppPdf) {
      this.showErrors = true;
      return;
    }

    this.uploadInProgress = true;

    let transformation;
    let transformationFormValue: CreateTransformation;

    if (this.fileType !== FileTypes.AppPdf) {
      transformation = this.dictionaryAndOrTransformationFormGroup.value.transformation;
      transformation.dsuuid = 'a';

      transformationFormValue =
        this.dictionaryAndOrTransformationFormGroup.get('transformation').value;
    }

    if (!this.dictionaryId) {
      let uploadedDictionary;

      const fileUploadInput = {
        fileInputRef: this.fileInput,
        fileName: this.dictionaryAndOrTransformationFormGroup.value.dictionary.name,
      };

      this.uploadService.upload(
        fileUploadInput,
        this.dictionaryAndOrTransformationFormGroup.get('dictionary').value.metaData,
      )
        .pipe(
          tap(res => this.handleFileUploadEvents(res)),
          filter(res => res.type === FileUploadEvents.OnUpload),
          switchMap(() =>
            this.dictionaryApiService.getDictionaries(this.fileType === FileTypes.AppPdf ? 'pdf' : 'xml')),
          switchMap((dictionaries) => {
            uploadedDictionary = dictionaries[0];

            if (this.fileType === FileTypes.AppPdf) {
              this.workflowStore.type = 'pdf';

              return of(false);
            } else {
              this.workflowStore.type = 'xml';
              transformation.dsid = uploadedDictionary.id;

              return this.transformationApiService.createTransformation(transformation);
            }
          }),
          switchMap((transformationResponse) => {
            if (transformationResponse) {
              this.newTransformation = transformationResponse;

              const transformationPatchData: { newId: string, transformation?: {xfspec?: Transformation}}  = {
                newId: transformationResponse.xfid,
              };
              if (!transformationFormValue.configurationId) {
                transformationPatchData.transformation = this.getInitializedTransformation(transformationFormValue);
                return of(transformationPatchData);
              } else {
                return this.transformationApiService
                  .getTransformationById(transformationFormValue.configurationId)
                  .pipe(
                    map((res) => {
                      return {
                        newId: transformationResponse.xfid,
                        transformation: {
                          xfspec: res.transform[0].transform,
                        },
                      };
                    }));
              }
            }
            return of(false);
          }),
          switchMap((patchData: any) => {
              if (patchData) {
                return this.transformationApiService
                  .patchTransformation(patchData.newId, patchData.transformation, uploadedDictionary.id);
              }

              return of(false);
          }),
      )
      .subscribe(() => {
        this.workflowStore.selectedDictionary = uploadedDictionary;
        this.workflowStore.selectedHeadword = null;

        const routerPath = [
          'dictionaries',
          this.workflowStore.type,
          uploadedDictionary.id,
        ];

        if (this.workflowStore.type === 'xml') {
          this.router
            .navigate([
              ...routerPath,
              'transformations',
              this.newTransformation.xfid,
            ]);
        } else {
          this.router
            .navigate([
              ...routerPath,
            ]);
        }

        return this.closeModalAndDisplayFeedbackToUser('Operation successful.');
      });
    } else {
      transformation.dsid = this.dictionaryId;

      this.transformationApiService.createTransformation(transformation)
        .pipe(
          switchMap((transformationResponse) => {
            this.newTransformation = transformationResponse;
            const transformationPatchData: { newId: string, transformation?: Transformation } = {
              newId: transformationResponse.xfid,
            };
            if (!transformationFormValue.configurationId) {
              transformationPatchData
                .transformation = this.getInitializedTransformation(transformationFormValue).xfspec;
              return of(transformationPatchData);
            } else {
              return this.transformationApiService
                .getTransformationById(transformationFormValue.configurationId)
                .pipe(
                  map((res) => {
                    return {newId: transformationResponse.xfid, transformation: res.transform[0].transform};
                  }));
              }
            }),
          switchMap((patchData) => {
            const newTransform = {
              xfspec: patchData.transformation,
            };
            return this.transformationApiService
              .patchTransformation(patchData.newId, newTransform, this.dictionaryId);
        }),
      ).subscribe((res) => {
        this.router.navigate([
          'dictionaries',
          'xml',
          transformation.dsid,
          'transformations',
          res[0].id,
        ]);

        this.closeModalAndDisplayFeedbackToUser('Transformation successfully created');
      });
    }
  }

  public onDictionaryReady(formGroup: FormGroup): void {
    this.dictionaryAndOrTransformationFormGroup.setControl('dictionary', formGroup);
  }

  public onFileInputReady(fileInput: FileUpload): void {
    this.fileInput = fileInput;
  }

  public onSelectFileType(type: string): void {
    this.fileType = type;
  }

  public onTransformationReady(formGroup: FormGroup): void {
    this.dictionaryAndOrTransformationFormGroup.setControl('transformation', formGroup);
  }

  private closeModalAndDisplayFeedbackToUser(message: string): void {
    this.uploadInProgress = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
    });
    this.ref.close(this.newTransformation || true);
  }

  private handleFileUploadEvents(res) {
    switch (true) {
      case FileUploadEvents.OnUpload === res.type:
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Dictionary successfully uploaded.',
        });

        this.progressPercentage = 100;

        break;

      case FileUploadEvents.OnProgress === res.type:
        this.progressPercentage = res.progress;
        break;

      case FileUploadEvents.OnError === res.type:
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          life: 10000,
          detail: 'Your dictionary file cannot be uploaded as the file is not well-formed. Well-formed XMLs info: https://elexifier.elex.is/help/',
        });

        break;
    }
  }
}
