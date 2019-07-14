import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from '@elexifier/core/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dictionaries/xml',
    pathMatch: 'full',
  },
  {
    path: 'dictionaries',
    redirectTo: 'dictionaries/xml',
    pathMatch: 'full',
  },
  {
    path: 'dictionaries/:workflowType',
    canActivate: [AuthGuard],
    loadChildren: () => import('./dictionaries/dictionaries.module').then(m => m.DictionariesModule),
  },
  {
    path: '',
    loadChildren: './public/public.module#PublicModule',
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadChildren: './user/user.module#UserModule',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { useHash: false }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
