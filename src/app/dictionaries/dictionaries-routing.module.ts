import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DictionariesComponent } from '@elexifier/dictionaries/dictionaries.component';
import { DictionariesPageComponent } from '@elexifier/dictionaries/components/dictionaries-page/dictionaries-page.component';
import { TransformationsPageComponent } from '@elexifier/dictionaries/components/transformations-page/transformations-page.component';

export const routes: Routes = [
  {
    path: '',
    component: DictionariesComponent,
    children: [
      {
        path: ':dictionaryId',
        component: DictionariesPageComponent,
        pathMatch: 'full',
      },
      {
        path: ':dictionaryId/transformations/:transformId',
        component: TransformationsPageComponent,
        pathMatch: 'full',
      },
      {
        path: ':dictionaryId/transformations/:transformId/edit',
        component: TransformationsPageComponent,
        pathMatch: 'full',
      },
      {
        path: '',
        component: DictionariesPageComponent,
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
export class DictionariesRoutingModule {}
