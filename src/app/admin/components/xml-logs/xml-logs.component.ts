import { Component, OnInit } from '@angular/core';
import {LogsApiService} from '@elexifier/admin/core/logs.service';
import {Log} from '@elexifier/admin/models/log';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'xml-app-logs',
  templateUrl: './xml-logs.component.html',
  styleUrls: ['./xml-logs.component.scss'],
})
export class XmlLogsComponent implements OnInit {
  public availableTags: string[] = [
    'upload',
    'xml_new',
    'xml_download',
  ];
  public dsid = '';
  public filteredLogs: Log[];
  public logs: Log[];
  public tag = '';

  public constructor(
    private logsApiService: LogsApiService,
    private route: ActivatedRoute,
  ) {
    route.queryParamMap.subscribe((queryParams) => {
      this.loadLogs();
    });
  }

  public filterLogs() {
    console.log(this.tag)
    if (!this.dsid.length && !this.tag.length) {
      this.filteredLogs = this.logs.filter(l => l.tag !== 'ml_error' && l.tag !== 'ml_finished');
    } else {
      this.filteredLogs = this.logs.filter(l => {
        return l.dsid.toString().indexOf(this.dsid) > -1 && l.tag === this.tag
          && (l.tag !== 'ml_error' && l.tag !== 'ml_finished');
      });
    }
  }

  public loadLogs() {
    this.logsApiService.getLogs()
      .subscribe((res) => {
        this.logs = res.logs;

        // Filter out PDF ML errors from
        this.filteredLogs = this.logs
          //.filter(l => l.tag !== 'ml_error' && l.tag !== 'ml_finished');
      });
  }

  public ngOnInit() {
    // this.loadLogs();
  }

}
