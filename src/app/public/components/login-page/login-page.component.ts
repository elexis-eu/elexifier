import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import { AuthService } from '@elexifier/core/auth.service';
import { environment } from '@env/environment';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {

  public loading = {
    loggingIn: false,
    loggingInWithSketch: true,
  };

  public loginFG: FormGroup;
  public showErrors = false;

  public sketchLoginReturn = encodeURI(`${environment.appUrl}/login?sketch_token=&elexifier=1`);

  public constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute,
  ) {}

  public ngOnInit() {
    console.log(this.sketchLoginReturn)
    const { sketch_token } = this.route.snapshot.queryParams;

    if (sketch_token) {
      this.authService.loginWithSketchEngine(sketch_token)
        .subscribe((res) => {
          if (res.auth_token) {
            setTimeout(() => {
              this.loading.loggingInWithSketch = false;
              this.router.navigate(['/dictionaries']);
            }, 2500);
          }
        });
    } else {
      this.loading.loggingInWithSketch = false;
    }

    this.loginFG = this.fb.group({
      login: [, Validators.required],
      password: [, Validators.required],
    });
  }

  public onLogin() {
    if (this.loginFG.invalid) {
      this.showErrors = true;
      return;
    }

    this.authService.login(this.loginFG.value)
      .subscribe(() => {
        this.router.navigate(['/dictionaries']);
      });
  }
}
