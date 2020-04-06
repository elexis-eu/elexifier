import { Component, OnInit } from '@angular/core';
import {SidebarStore} from '@elexifier/store/sidebar.store';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
})
export class AdminComponent implements OnInit {

  public constructor(
    private sidebarStore: SidebarStore,
    private router: Router,
  ) { }

  public ngOnInit() {
    this.sidebarStore.setDepth(0);
  }


  public isActive(instruction: any[]): boolean {
    // Set the second parameter to true if you want to require an exact match.
    return this.router.isActive(this.router.createUrlTree(instruction), true);
  }

}
