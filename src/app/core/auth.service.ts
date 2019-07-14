import { Injectable } from '@angular/core';
import { environment } from '@env/environment';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { setMany } from 'xsm';
import { AuthenticatedUser } from '@elexifier/shared/type/authenticated-user.interface';

interface LoginUser {
  login: string; // TODO: rename on the BE
  password: string;
}

interface RegisterUser {
  email: string;
  password: string;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  public constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  public getLoggedInUser(): Observable<AuthenticatedUser> {
    return this.http.get<AuthenticatedUser>(`${environment.apiUrl}/user/logged-in`)
      .pipe(
        tap((authenticatedUser) => {
          setMany({
            user: authenticatedUser,
            isLoggedIn: !!localStorage.getItem('auth_token'),
          });
        }),
      );
  }

  public login(user: LoginUser): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(`${environment.apiUrl}/login`, user)
      .pipe(tap((authenticatedUser) => this.handleLogin(authenticatedUser)));
  }

  public loginWithSketchEngine(sketchToken: string) {
    return this.http.post<AuthenticatedUser>(`${environment.apiUrl}/login`, { sketch_token: sketchToken})
      .pipe(tap((authenticatedUser) => this.handleLogin(authenticatedUser)));
  }

  public logout() {
    localStorage.removeItem('auth_token');

    setMany({
      user: null,
      isLoggedIn: !!localStorage.getItem('auth_token'),
      dictionaries: [],
      transformations: [],
    });

    this.router.navigate(['/login']);
  }

  public register(user: RegisterUser): Observable<AuthenticatedUser> {
    return this.http.post<AuthenticatedUser>(`${environment.apiUrl}/user/new`, user)
      .pipe(tap((authenticatedUser) => this.handleLogin(authenticatedUser)));
  }

  private handleLogin(authenticatedUser: AuthenticatedUser) {
    localStorage.setItem('auth_token', authenticatedUser.auth_token);

    setMany({
      user: authenticatedUser,
      isLoggedIn: !!localStorage.getItem('auth_token'),
    });
  }
}
