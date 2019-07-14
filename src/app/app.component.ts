import { Component } from '@angular/core';
import { bindState, get, set } from 'xsm';
import { AuthService } from '@elexifier/core/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  public isLoggedIn: boolean;
  public user: null;

  public constructor(
    private authService: AuthService,
  ) {
    bindState(this, {
      user: null,
      isLoggedIn: false,
    });

    set('isLoggedIn', !!localStorage.getItem('auth_token'));
    this.isLoggedIn = get('isLoggedIn');

    if (this.isLoggedIn) {
      this.authService.getLoggedInUser()
        .subscribe(user => {
          set('user', user);
        });
    }
  }
}
