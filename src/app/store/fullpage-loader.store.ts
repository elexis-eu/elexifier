import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FullpageLoaderStore {

  /* tslint:disable */
  private readonly _loading = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this._loading.asObservable();

  public get loading(): boolean {
    return this._loading.getValue();
  }

  public set loading(val: boolean) {
    this._loading.next(val);
  }

  public constructor() {}
}
