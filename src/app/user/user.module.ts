import { NgModule } from '@angular/core';
import { SharedModule as UserSharedModule } from '@elexifier/user/shared/shared.module';
import { UserComponent } from '@elexifier/user/user.component';
import { UserRoutingModule } from '@elexifier/user/user-routing.module';
import { SharedModule } from '@elexifier/shared/shared.module';
import { ProfilePageComponent } from '@elexifier/user/components/profile-page/profile-page.component';

@NgModule({
  declarations: [
    UserComponent,
    ProfilePageComponent,
  ],
  imports: [
    UserRoutingModule,
    SharedModule,
    UserSharedModule,
  ],
})
export class UserModule { }
