import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminComponent } from './admin.component';
import { LogsComponent } from './components/logs/logs.component';
import {RouterModule} from '@angular/router';
import {SharedModule} from '@elexifier/shared/shared.module';
import {AdminRoutingModule} from '@elexifier/admin/admin-routing.module';
import { LogDetailsComponent } from './components/logs/log-details/log-details.component';
import {ButtonModule} from 'primeng/button';
import { XmlLogsComponent } from './components/xml-logs/xml-logs.component';



@NgModule({
  declarations: [
    AdminComponent,
    LogsComponent,
    LogDetailsComponent,
    XmlLogsComponent,
  ],
    imports: [
        CommonModule,
        RouterModule,
        SharedModule,
        AdminRoutingModule,
        ButtonModule,
    ],
})
export class AdminModule { }
