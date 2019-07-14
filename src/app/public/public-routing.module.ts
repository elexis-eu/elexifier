import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicComponent } from '@elexifier/public/public.component';
import { LoginPageComponent } from '@elexifier/public/components/login-page/login-page.component';
import { RegisterPageComponent } from '@elexifier/public/components/register-page/register-page.component';
import { ContactPageComponent } from '@elexifier/public/components/contact-page/contact-page.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicComponent,
    children: [
      {
        path: 'login',
        component: LoginPageComponent,
        pathMatch: 'full',
      },
      {
        path: 'register',
        component: RegisterPageComponent,
        pathMatch: 'full',
      },
      {
        path: 'contact',
        component: ContactPageComponent,
        pathMatch: 'full',
      },
    ],
  },
];
@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule,
  ],
})
export class PublicRoutingModule {}
