import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SidebarStore {
  get depth(): Observable<number> {
    return this._depth.asObservable();
  }

  private _depth = new BehaviorSubject<number>(0);

  public constructor() {}

  public setDepth(depth): void {
    this._depth.next(depth);
  }

  public reload() {
    this._depth.next(this._depth.value);
  }
}
