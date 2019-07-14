import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { Dictionary } from '@elexifier/dictionaries/core/type/dictionary.interface';
import {map, switchMap, tap} from 'rxjs/operators';
import { set } from 'xsm';
import { Order } from '@elexifier/shared/type/order.enum';
import { FileTypes } from '@elexifier/dictionaries/core/type/file-types.enum';
import {DataHelperService} from '@elexifier/dictionaries/core/data-helper.service';

enum UploadDictionaryResponse {
  Ok = 'OK',
}

interface PdfWorkflowStatusResponse {
  file_path: string;
  id: number;
  lexonomy_access: string;
  lexonomy_delete: string;
  lexonomy_edit: string;
  lexonomy_ml_access: string;
  lexonomy_ml_delete: string;
  lexonomy_ml_edit: string;
  lexonomy_ml_status: string;
  lexonomy_status: string;
  name: string;
  size: number;
  status: string;
  upload_mimetype: string;
  upload_uuid: string;
  uploaded_ts: string;
  xml_file_path: string;
  xml_lex: string;
  xml_ml_out: string;
}

interface MetadataResponse {
  metadata: object;
}

@Injectable({
  providedIn: 'root',
})
export class DictionaryApiService {

  public constructor(
    private http: HttpClient,
  ) {
  }

  public deleteDictionary(dictionaryId: string): Observable<Dictionary[]> {
    return this.http.delete<Dictionary[]>(`${ environment.apiUrl }/dataset/${dictionaryId}`)
      .pipe(switchMap(() => this.getDictionaries())); // TODO: return dictionaries from server
  }

  public fetchFileFromLexonomy(dictionaryId: string) { // TODO: add type
    return this.http.get(`${ environment.apiUrl }/ml/${dictionaryId}?get_file=True`);
  }

  public getDictionaries(type?: string): Observable<Dictionary[]> {
    const dictionaryType = type === 'pdf' ? '&mimetype=' + FileTypes.AppPdf : '';

    return this
      .http
      .get<Dictionary[]>(`${ environment.apiUrl }/dataset/list?order=${ Order.Desc }${ dictionaryType }`)
      .pipe(
        tap(dictionaries => {
          set('dictionaries', dictionaries);
        }),
      );
  }


  public getMetadata(dictionaryId: string): Observable<MetadataResponse> { // TODO: add type
    return this.http.get<MetadataResponse>(`${ environment.apiUrl }/get_metadata/${dictionaryId}`)
      .pipe(
        map(res => res.metadata),
        map((metadata) => DataHelperService.convertNulledArraysInObjectToArray(metadata)),
        map((metadata) => DataHelperService.convertFormattedStringInObjectToDates(metadata)),
      );
  }

  public getPdfWorkflowStatusByDictionary(dictionaryId: string): Observable<PdfWorkflowStatusResponse> {
    return this.http.get<PdfWorkflowStatusResponse>(`${ environment.apiUrl }/dataset/${dictionaryId}`);
  }

  public saveMetadata(dictionaryId: string, metaData) { // TODO: add type
    let _metaData = DataHelperService.convertArraysInObjectToNull(metaData);
    _metaData = DataHelperService.convertDatesInObjectToFormattedString(_metaData);

    const data = {
      ds_metadata: JSON.stringify(_metaData),
    };

    return this.http.post(`${ environment.apiUrl }/save_metadata/${dictionaryId}`, data);
  }

  public startAnnotateProcess(dictionaryId: string) { // TODO: add type
    return this.http.get(`${ environment.apiUrl }/lexonomy/${dictionaryId}`);
  }

  public startMlProcess(dictionaryId: string) { // TODO: add type
    return this.http.get(`${ environment.apiUrl }/ml/${dictionaryId}?run_ml=True`);
  }

  public startPreviewProcess(dictionaryId: string) { // TODO: add type
    return this.http.get(`${ environment.apiUrl }/ml/${dictionaryId}?send_file=True`);
  }

  // TODO: this should be done on the backend - there should be only 1 endpoint and it should contain the logic below
  public triggerMlWorkflow(dictionaryId: string) { // TODO: add type
    return this.fetchFileFromLexonomy(dictionaryId)
      .pipe(
        switchMap(() => this.startMlProcess(dictionaryId)),
      );
  }

  public uploadDictionary(data): Observable<UploadDictionaryResponse> { // TODO: add interface
    return this.http.post<UploadDictionaryResponse>(`${ environment.apiUrl }/dataset/upload`, data);
  }
}
