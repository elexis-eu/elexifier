import { Component, OnInit } from '@angular/core';
import {LogsApiService} from '@elexifier/admin/core/logs.service';
import {Log} from '@elexifier/admin/models/log';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss'],
})
export class LogsComponent implements OnInit {
  public logs: Log[];

  public constructor(
    private logsApiService: LogsApiService,
    private route: ActivatedRoute,
  ) {
    route.queryParamMap.subscribe((queryParams) => {
      const errorOnly = !!queryParams.get('errorOnly');
      this.loadLogs(errorOnly);
    });
  }

  public loadLogs(errorOnly = false) {
    this.logsApiService.getLogs(errorOnly)
      .subscribe((res) => {
        const allLogs = res.logs;
        if (errorOnly) {
          this.logs = allLogs.filter(l => l.tag === 'ml_error');
        } else {
          this.logs = res.logs;
        }
      });
  }

  public ngOnInit() {
    // this.loadLogs();
  }

}
