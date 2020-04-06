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

  public constructor(
    private logService: LogsApiService,
    private route: ActivatedRoute,
  ) {
  }

  public ngOnInit() {
    this.logId = this.route.snapshot.paramMap.get('id');
    this.logService.getLogById(this.logId)
      .subscribe((res) => {
        this.log = res;
      });
  }

  public onDownloadAnnotations() {
    this.logService.downloadAnnotations(this.logId)
      .subscribe((res: any) => {
        const blob = new Blob([res]);
        saveAs(blob, `Annotations - ${this.logId}`);
      });
  }

  public onDownloadPdf() {
    this.logService.downloadPdf(this.logId)
      .subscribe((res: any) => {
        const blob = new Blob([res]);
        saveAs(blob, `PDF - ${this.logId}.pdf`);
      });
  }

  public onDownloadXml() {
    this.logService.downloadOriginalXml(this.logId)
      .subscribe((res: any) => {
        const blob = new Blob([res]);
        saveAs(blob, `OriginalXml - ${this.logId}`);
      });
  }
}
