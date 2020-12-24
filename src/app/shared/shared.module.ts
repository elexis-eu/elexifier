import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { NavbarComponent } from '@elexifier/shared/navbar/navbar.component';
import { ToastModule } from 'primeng/toast';
import { FormValidationComponent } from './form-validation/form-validation.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { IconsModule } from '@elexifier/shared/icons.module';
import { TooltipModule } from 'primeng/tooltip';
import { FullpageLoaderComponent } from '@elexifier/shared/fullpage-loader/fullpage-loader.component';
import { NgbDropdownModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PdfWorkflowOptionsComponent } from '@elexifier/shared/sidebar/pdf-workflow-options/pdf-workflow-options.component';
import { ProgressSpinnerModule } from 'primeng';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    MenuModule,
    ToastModule,
    IconsModule,
    TooltipModule,
    NgbModule,
    NgbDropdownModule,
    ProgressSpinnerModule,
  ],
  declarations: [
    NavbarComponent,
    FormValidationComponent,
    SidebarComponent,
    FullpageLoaderComponent,
    PdfWorkflowOptionsComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgbModule,
    MenuModule,
    ToastModule,
    NavbarComponent,
    FormValidationComponent,
    SidebarComponent,
    TooltipModule,
    FullpageLoaderComponent,
    NgbDropdownModule,
    PdfWorkflowOptionsComponent,
  ],
  providers: [],
})
export class SharedModule {}
