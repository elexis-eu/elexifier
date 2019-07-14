import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule as PublicSharedModule } from '@elexifier/shared/shared.module';
import { PublicComponent } from '@elexifier/public/public.component';
import { LoginPageComponent } from '@elexifier/public/components/login-page/login-page.component';
import { RegisterPageComponent } from '@elexifier/public/components/register-page/register-page.component';
import { ContactPageComponent } from '@elexifier/public/components/contact-page/contact-page.component';
import { PublicRoutingModule } from '@elexifier/public/public-routing.module';
import { SharedModule } from '@elexifier/shared/shared.module';
import {ProgressBarModule} from 'primeng/progressbar';

@NgModule({
  declarations: [
    PublicComponent,
    LoginPageComponent,
    RegisterPageComponent,
    ContactPageComponent,
  ],
  imports: [
    CommonModule,
    PublicRoutingModule,
    SharedModule,
    PublicSharedModule,
    ProgressBarModule,
  ],
})
export class PublicModule { }
