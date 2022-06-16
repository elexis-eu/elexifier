import { Injectable } from '@angular/core';
import {Observable, of} from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { CreateTransformation } from '@elexifier/dictionaries/core/type/create-transformation.interface';
import { Transformation } from '@elexifier/dictionaries/core/type/transformation.interface';
import {map, switchMap, tap} from 'rxjs/operators';
import { Order } from '@elexifier/shared/type/order.enum';
import { set } from 'xsm';
import {TransformationEntityResponse} from '@elexifier/dictionaries/core/type/transformation-entity.interface';
import {AppliedTransformationResponse} from '@elexifier/dictionaries/core/type/applied-transformation.interface';
import {DataHelperService} from '@elexifier/dictionaries/core/data-helper.service';

@Injectable({
  providedIn: 'root',
})
export class TransformationApiService {

  public constructor(
    private http: HttpClient,
  ) { }

  public validateTransformation(transformId: number, entityId: number) {
    return this.http.get(
      `${environment.apiUrl}/transform/${transformId}/apply/${entityId}?strip_ns=true&strip_header=false&strip_dict_scrap=false`,
    );
  }

  public applyTransformation(
    transformId: number,
    entityId: number,
    stripSettings: { dictScrap: boolean, namespaces: boolean, teiHeader: boolean},
    ): Observable<AppliedTransformationResponse> {

    // TODO: Add params as HttpParams
    return this.http.get<any>(
      `${environment.apiUrl}/transform/${ transformId }/apply/${ entityId }?strip_ns=${ stripSettings.namespaces }&strip_header=${stripSettings.teiHeader}&strip_dict_scrap=${stripSettings.dictScrap}`,
    ).pipe(
      switchMap((res) => {
        const transformer = res.spec.pos;

        // if (transformer && transformer.xlat) {
        //   const mirroredXlat = DataHelperService.mirrorObject(transformer.xlat);
        //   transformer.xlat = mirroredXlat;
        // }
        return of(res);
      }));
  }

  public getExistingConfigurations(): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/transform/list`,
    );
  }

  public checkFileStatus(transformId: number, dictionaryId: number): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/transform/${transformId}/download/${dictionaryId}?status=true`,
    );
  }

  public filterHeadwords(transformId: number, dictionaryId: number, pattern?: string): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/transform/${transformId}/search/${dictionaryId}?pattern=${pattern || ''}`,
    );
  }

  // TODO: Add interface
  public createTransformation(transformation: CreateTransformation): Observable<any> {
    return this.http.post(`${environment.apiUrl}/transform/new`, transformation);
  }

  public deleteTransformation(transformationId: number, dictionaryId: number): Observable<Transformation[]> {
    return this.http.delete<Transformation[]>(`${environment.apiUrl}/transform/${transformationId}`)
      .pipe(switchMap(() => this.getTransformationsByDictionaryId(dictionaryId)));
      // TODO: return transformations from server
  }

  public downloadTransformation(transformId: number, dictionaryId: number, stripNs = false) { // TODO: interface
    return this.http.get(
      `${environment.apiUrl}/transform/${transformId}/download/${dictionaryId}?strip_ns=${stripNs}`,
      {responseType: 'text', observe: 'response' as 'response'},
    );
  }

  public getAvailableNodes(dictionaryId): Observable<any> { // TODO: Add interface
    return this.http.get(`${environment.apiUrl}/xml_nodes/${dictionaryId}`);
  }


  public getAvailablePartOfSpeech(dictionaryId, posElement, attributeName?): Observable<any> { // TODO: Add interface
    return this.http.post(`${environment.apiUrl}/xml_pos/${dictionaryId}`, {
      pos_element: posElement.filter(e => e.length > 0),
      attribute_name: attributeName.length ? attributeName : null,
    });
  }

  public getAvailablePaths(dictionaryId): Observable<any> { // TODO: Add interface
    return this.http.get(`${environment.apiUrl}/xml_paths/${dictionaryId}`);
  }

  public getSavedConfigurations(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/transform/saved`);
  }

  public getTransformationById(id: number, page = 1): Observable<TransformationEntityResponse> {
    return this.http.get<TransformationEntityResponse>(`${environment.apiUrl}/transform/${id}?page_num=${page}`)
      .pipe(
        switchMap((res) => {
          res.transform[0].transform = DataHelperService.deserializeLanguageModels(res.transform[0].transform);

          // if (transformer && transformer.xlat) {
          //   const mirroredXlat = DataHelperService.mirrorObject(transformer.xlat);
          //   transformer.xlat = mirroredXlat;
          // }

          return of(res);
        }));
  }

  public getTransformationsByDictionaryId(id: number): Observable<any> {
    return this.http.get<Transformation[]>(`${environment.apiUrl}/transform/list/${id}?order=${Order.Desc}`)
      .pipe(tap((transformations) => set('transformations', transformations)));
  }

  // TODO: interface
  public patchTransformation(transformationId: number, partialTransformation, dictionaryId?: number): Observable<any> {
    if (dictionaryId) {
      return this.http.post(`${environment.apiUrl}/transform/${ transformationId }`, partialTransformation)
        .pipe(switchMap(() => this.getTransformationsByDictionaryId(dictionaryId)));
    } else {
      return this.http.post(`${environment.apiUrl}/transform/${ transformationId }`, partialTransformation);
    }
  }

  public prepareTransformationDownload(transformId: number, dictionaryId: number, stripNs = false) {
    return this.http.get(
      `${environment.apiUrl}/transform/${transformId}/download/${dictionaryId}?strip_ns=${stripNs}`);
  }

  public downloadValidationLog(transformId: number, dictionaryId: number) {
    return this.http.get(
      `${environment.apiUrl}/transform/${transformId}/validation/${dictionaryId}`,
      {responseType: 'text', observe: 'response' as 'response'},
    );
  }
}
