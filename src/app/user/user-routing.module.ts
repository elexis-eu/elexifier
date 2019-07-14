import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from '@elexifier/user/user.component';
import { ProfilePageComponent } from '@elexifier/user/components/profile-page/profile-page.component';

export const routes: Routes = [
  {
    path: '',
    component: UserComponent,
    children: [
      {
        path: 'profile',
        component: ProfilePageComponent,
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
export class UserRoutingModule {}
