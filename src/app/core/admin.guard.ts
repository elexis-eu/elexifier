import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {UserStore} from '@elexifier/store/user.store';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {

  public constructor(
    private router: Router,
    private userStore: UserStore,
  ) {}

  public canActivate(): boolean {

    if (this.userStore.user.admin) {
      return true;
    }

    // TODO: Fix direct loading e.g. /admin/logs
    this.router.navigate(['']);
    return false;
  }
}
