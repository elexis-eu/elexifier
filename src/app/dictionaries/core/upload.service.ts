import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { from, Observable, Observer } from 'rxjs';
import { concatMap, switchMap, take } from 'rxjs/operators';
import { DictionaryApiService } from '@elexifier/dictionaries/core/dictionary-api.service';
import { FileUploadEvents } from '@elexifier/dictionaries/core/type/file-upload-events.enum';
import { FileUpload } from 'primeng/primeng';
import { UploadDictionaryResponse } from '@elexifier/dictionaries/core/type/upload-dictionary-response.enum';
import {DataHelperService} from '@elexifier/dictionaries/core/data-helper.service';

interface FileUploadResponse {
  progress?: number;
  type: FileUploadEvents;
}

interface FileUploadApiResponse {
  current_chunk?: number;
  file_path?: string;
  status?: string;
  total_chunks?: number;
}

interface FileUploadInput {
  fileInputRef: FileUpload;
  fileName: string;
}

interface SliceFileInput {
  end: number;
  file: string;
  start: number;
}

interface FileUploadMetadata {
  headerBibl: string;
  headerPublisher: string;
  headerTitle: string;
}

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  public constructor(
    private messageService: MessageService,
    private dictionaryApiService: DictionaryApiService,
  ) { }

  public sliceFile({ file, start, end }: SliceFileInput) {
    return file.slice(start, end);
  }

  public upload(fileUploadInput: FileUploadInput, metaData) {
    return new Observable((observer: Observer<FileUploadResponse>) => {

      fileUploadInput.fileInputRef.uploadHandler
        .pipe(
          take(1),
          switchMap(res => this.uploadFile(res, metaData, fileUploadInput.fileName)),
        )
        .subscribe((response: FileUploadApiResponse) => {

          switch (true) {
            case !!response.file_path:
              observer.next({ type: FileUploadEvents.OnUpload, progress: 100 });
              observer.complete();
              break;

            case response.status === UploadDictionaryResponse.Progress:
              const progress = this.calculateProgressPercentage(response.current_chunk, response.total_chunks);
              observer.next({ type: FileUploadEvents.OnProgress, progress });
              break;

            default:
              observer.next({ type: FileUploadEvents.OnError });
              observer.complete();
              break;
          }
        });

      fileUploadInput.fileInputRef.upload();
    });
  }

  public uploadFile(data, metaData: FileUploadMetadata, fileName?: string): Observable<any> {
    const file = data.files[0];

    const size = file.size;
    const chunkSize = 20000;
    const chunks = Math.ceil(file.size / chunkSize);

    const fileChunks: FormData[] = [];
    let currentChunk = 0;

    let _metaData = DataHelperService.convertArraysInObjectToNull(metaData);
    _metaData = DataHelperService.convertDatesInObjectToFormattedString(_metaData);

    while (currentChunk <= chunks) {
      const formData: FormData = new FormData();

      // TODO: change this insane poor man's naming on the BE and reimplement on the FE
      formData.append('dzchunkindex', currentChunk.toString());
      formData.append('dztotalfilesize', size);
      formData.append('dzchunksize', chunkSize.toString());
      formData.append('dztotalchunkcount', chunks.toString());
      formData.append('dzchunkbyteoffset', (currentChunk * chunkSize).toString());
      formData.append('metadata', JSON.stringify(DataHelperService.convertArraysInObjectToNull(metaData)));

      // Due to poor man's BE upload handling we have to set dictionary data name here - 3rd argument
      formData.append(
        'file',
        this.sliceFile({
          file,
          start: currentChunk * chunkSize,
          end: (currentChunk + 1) * chunkSize,
        }),
        // Using files actual name for now as the backend can not suport aliases.
        // TODO: Rework when dictionary aliases are available on the backend.
        file.name,
      );

      fileChunks.push(formData);

      currentChunk++;
    }

    return this.uploadFileChunks(fileChunks);
  }

  public uploadFileChunks(chunks: FormData[]): Observable<any> { // TODO: add type
    return from(chunks)
      .pipe(concatMap(formData => this.dictionaryApiService.uploadDictionary(formData)));
  }

  private calculateProgressPercentage(currentChunk, totalChunks): number {
    const percentage = (currentChunk / totalChunks) * 100;

    return parseInt(percentage.toFixed(0), 0);
  }
}
