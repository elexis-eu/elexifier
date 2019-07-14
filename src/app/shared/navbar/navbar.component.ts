import { Component, OnInit } from '@angular/core';
import { AuthService } from '@elexifier/core/auth.service';
import { bindState, get } from 'xsm';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  public isLoggedIn: boolean;
  public user: any | null;

  public constructor(
    private authService: AuthService,
  ) {
    bindState(this, {
      user: null,
      isLoggedIn: false,
    });
  }

  public ngOnInit() {
    this.user = get('user');
    this.isLoggedIn = get('isLoggedIn');
  }
}
