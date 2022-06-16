import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarStore {
  get depth(): Observable<number> {
    return this._depth.asObservable();
  }

  get reloader(): Observable<null> {
    return this._reloader.asObservable();
  }

  private _depth = new BehaviorSubject<number>(0);
  private _reloader = new BehaviorSubject<null>(null);

  public constructor() {}

  public setDepth(depth): void {
    this._depth.next(depth);
  }

  public reload() {
    this._depth.next(this._depth.value);
  }

  public reloadSidebarContent() {
    this._reloader.next(null);
  }

}
