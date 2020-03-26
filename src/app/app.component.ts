import { Component } from '@angular/core';
import { bindState, get, set } from 'xsm';
import { AuthService } from '@elexifier/core/auth.service';
import {UserStore} from '@elexifier/store/user.store';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  public isLoggedIn: boolean;
  public user: null;

  public constructor(
    private authService: AuthService,
    private userStore: UserStore,
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
          userStore.user = user;
          set('user', user);
        });
    }
  }
}
