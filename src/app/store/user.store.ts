import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {AuthenticatedUser} from '@elexifier/shared/type/authenticated-user.interface';

@Injectable({
  providedIn: 'root',
})
export class UserStore {

  /* tslint:disable */
  private readonly _user = new BehaviorSubject<AuthenticatedUser>(null);
  public readonly user$ = this._user.asObservable();

  public get user(): AuthenticatedUser {
    return this._user.getValue();
  }

  public set user(val: AuthenticatedUser) {
    this._user.next(val);
  }

  public constructor() {}
}
