import { Component, OnInit } from '@angular/core';
import {SidebarStore} from '@elexifier/store/sidebar.store';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {

  public constructor(
    private sidebarStore: SidebarStore,
  ) { }

  public ngOnInit() {
    this.sidebarStore.setDepth(0);
  }

}
