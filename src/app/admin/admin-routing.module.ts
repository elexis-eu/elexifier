import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AdminComponent} from '@elexifier/admin/admin.component';
import {LogsComponent} from '@elexifier/admin/components/logs/logs.component';
import {LogDetailsComponent} from '@elexifier/admin/components/logs/log-details/log-details.component';
import { XmlLogsComponent } from '@elexifier/admin/components/xml-logs/xml-logs.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'logs',
  },
  {
    path: '',
    component: AdminComponent,
    children: [
      {
        path: 'logs/pdf',
        component: LogsComponent,
        pathMatch: 'full',
      },
      {
        path: 'logs/pdf/:id',
        component: LogDetailsComponent,
        pathMatch: 'full',
      },
      {
        path: 'logs/xml',
        component: XmlLogsComponent,
        pathMatch: 'full',
      },
      {
        path: 'logs/xml/:id',
        component: LogDetailsComponent,
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
export class AdminRoutingModule {}
