import { Component, OnInit } from '@angular/core';
import { FullpageLoaderStore } from '@elexifier/store/fullpage-loader.store';

@Component({
  selector: 'app-fullpage-loader',
  templateUrl: './fullpage-loader.component.html',
  styleUrls: ['./fullpage-loader.component.scss'],
})
export class FullpageLoaderComponent implements OnInit {
  public loading = false;

  public constructor(
    public fullpageLoader: FullpageLoaderStore,
  ) {}

  public ngOnInit() {
    this.fullpageLoader.loading$
      .subscribe((loading) => {
        this.loading = loading;
      });
  }
}
