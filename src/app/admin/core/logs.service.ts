import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import {Log} from '@elexifier/admin/models/log';
import * as queryString from 'querystring';

interface LogsResponse {
  logs: Log[];
}
@Injectable({
  providedIn: 'root',
})
export class LogsApiService {

  public constructor(
    private http: HttpClient,
  ) { }

  public downloadAnnotations(id: string): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/support/${id}?xml_lex=1`,
      { responseType: 'text'},
    );
  }

  public downloadOriginalXml(id: string): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/support/${id}?xml_raw=1`,
      { responseType: 'text'},
    );
  }

  public downloadPdf(id: string): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/support/${id}?pdf=1`,
      { responseType: 'arraybuffer'},
    );
  }

  public getLogById(id: string): Observable<any> {
    return this.http.get<LogsResponse>(
      `${environment.apiUrl}/support/${id}`,
    );
  }

  public getLogs(): Observable<LogsResponse> {
    return this.http.get<LogsResponse>(
      `${environment.apiUrl}/support/list`,
    );
  }
}
