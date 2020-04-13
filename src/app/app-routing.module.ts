import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@elexifier/core/auth.guard';
import {AdminGuard} from '@elexifier/core/admin.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
  },
  {
    path: 'dictionaries/:workflowType',
    canActivate: [AuthGuard],
    loadChildren: () => import('./dictionaries/dictionaries.module').then(m => m.DictionariesModule),
  },
  {
    path: 'dictionaries',
    redirectTo: 'dictionaries/xml',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'dictionaries/xml',
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () => import('./public/public.module').then(m => m.PublicModule),
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: false }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
