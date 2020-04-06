import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import {UserStore} from '@elexifier/store/user.store';
import { AuthService } from '@elexifier/core/auth.service';
import { Observable } from 'rxjs';
import { first, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {

  public constructor(
    private router: Router,
    private userStore: UserStore,
    private authService: AuthService,
  ) {}

  public canActivate(): Observable<boolean> {
    return this.authService.getLoggedInUser().pipe(
      map((user) => {
        if (!user.admin) {
          this.router.navigate(['dictionaries']);
        }
        return user.admin;
      }));
  }
}
