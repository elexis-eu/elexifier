import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@elexifier/core/auth.service';

@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss'],
})
export class RegisterPageComponent implements OnInit {
  public registerFG: FormGroup;
  public showErrors = false;

  public constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
  ) {}

  public ngOnInit() {
    this.registerFG = this.fb.group({
      email: [, Validators.required],
      password: [, Validators.required],
    });
  }

  public onRegister() {
    if (this.registerFG.invalid) {
      this.showErrors = true;
      return;
    }

    // TODO: api call, write token to the localstorage

    this.authService.register(this.registerFG.value)
      .subscribe(() => {

        this.router.navigate(['/dictionaries']);
      });
  }
}
