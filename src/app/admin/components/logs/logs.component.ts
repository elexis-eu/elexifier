import { Component, OnInit } from '@angular/core';
import {LogsApiService} from '@elexifier/admin/core/logs.service';
import {Log} from '@elexifier/admin/models/log';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
})
export class LogsComponent implements OnInit {
  public logs: Log[];

  public constructor(
    private logsApiService: LogsApiService,
  ) { }

  public ngOnInit() {
    this.logsApiService.getLogs()
      .subscribe((res) => {
        this.logs = res.logs;
      });
  }

}
