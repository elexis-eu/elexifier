import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  public constructor(
    private router: Router,
  ) {}

  public canActivate(): boolean {

    const tokenExists = !!localStorage.getItem('auth_token');

    if (tokenExists) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}
