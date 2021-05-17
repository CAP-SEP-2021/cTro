import { Component, OnInit } from '@angular/core';
import {OrderListView, UserListView} from '../../shared/view-models/interfaces';
import {Subscription} from 'rxjs';
import {Pageable} from '../../shared/backend-models/interfaces';
import {TranslocoService} from '@ngneat/transloco';
import * as moment from "moment";

@Component({
  selector: 'app-admin-cockpit',
  templateUrl: './admin-cockpit.component.html',
  styleUrls: ['./admin-cockpit.component.scss']
})
export class AdminCockpitComponent implements OnInit {

  private translocoSubscription = Subscription.EMPTY;
  private pageable: Pageable = {
    pageSize: 8,
    pageNumber: 0,
    // total: 1,
  };

  users: UserListView[] = [];
  columns: any[];

  totalUsers: number;
  pageSize = 8;

  pageSizes: number[];


  displayedColumns: string[] = [
    'userView.email',
    'userView.name',
    'userView.role',
  ];



  constructor(
    private translocoService: TranslocoService,
    private AdminCockpitService: TranslocoService,

  ) { }

  ngOnInit(): void {
    this.translocoService.langChanges$.subscribe((event: any) => {
      this.setTableHeaders(event);
      moment.locale(this.translocoService.getActiveLang());
    });
  }

  setTableHeaders(lang: string): void {
    this.translocoSubscription = this.translocoService
      .selectTranslateObject('cockpit.users', {}, lang)
      .subscribe((cockpitTable) => {
        this.columns = [
          { name: 'userView.email', label: cockpitTable.emailH },
          { name: 'userView.name', label: cockpitTable.nameH },
          { name: 'userView.role', label: cockpitTable.roleH },
        ];
      });
    this.translocoSubscription = this.translocoService
      .selectTranslateObject('alerts.waiterCockpitAlerts', {}, lang)
      .subscribe((alertsWaiterCockpitAlerts) => { });
  }

  printElement(element: any): void{
    console.log(element);
  }

  applyFilters(): void {
    this.AdminCockpitService
      .getUsers(this.pageable)
      .subscribe((data: any) => {
        if (!data) {
          this.users = [];
        } else {
          this.users = data.content;
        }
       
      });
  }

}
