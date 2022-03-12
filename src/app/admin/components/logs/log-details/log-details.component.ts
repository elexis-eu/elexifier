import { Component, OnInit } from '@angular/core';
import {LogsApiService} from '@elexifier/admin/core/logs.service';
import {ActivatedRoute} from '@angular/router';
import {Log} from '@elexifier/admin/models/log';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-log-details',
  templateUrl: './log-details.component.html',
  styleUrls: ['./log-details.component.scss'],
})
export class LogDetailsComponent implements OnInit {
  public log: Log;
  public logId: string;

  public downloadingAnnotations = false;
  public downloadingXml = false;
  public downloadingPdf = false;
  public hideDownloadButtons = false;

  public constructor(
    private logService: LogsApiService,
    private route: ActivatedRoute,
  ) {
  }

  public ngOnInit() {
    this.logId = this.route.snapshot.paramMap.get('id');
    this.hideDownloadButtons = this.route.snapshot.routeConfig.path.includes('xml');
    
    this.logService.getLogById(this.logId)
      .subscribe((res) => {
        this.log = res;
      });
  }

  public onDownloadAnnotations() {
    this.downloadingAnnotations = true;
    this.logService.downloadAnnotations(this.logId)
      .subscribe((res: any) => {
        this.downloadingAnnotations = false;
        const blob = new Blob([res]);
        saveAs(blob, `Annotations - ${this.logId}`);
      }, () => this.downloadingAnnotations = false);
  }

  public onDownloadPdf() {
    this.downloadingPdf = true;
    this.logService.downloadPdf(this.logId)
      .subscribe((res: any) => {
        this.downloadingPdf = false;
        const blob = new Blob([res]);
        saveAs(blob, `PDF - ${this.logId}.pdf`);
      }, () =>
        this.downloadingPdf = false);
  }

  public onDownloadXml() {
    this.downloadingXml = true;
    this.logService.downloadOriginalXml(this.logId)
      .subscribe((res: any) => {
        this.downloadingXml = false;
        const blob = new Blob([res]);
        saveAs(blob, `OriginalXml - ${this.logId}`);
      }, () =>
        this.downloadingXml = false);
  }
}
