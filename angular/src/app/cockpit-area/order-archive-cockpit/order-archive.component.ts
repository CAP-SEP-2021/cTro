import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { TranslocoService } from '@ngneat/transloco';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { ConfigService } from '../../core/config/config.service';
import {
  FilterCockpit,
  Pageable,
} from '../../shared/backend-models/interfaces';
import { OrderListView } from '../../shared/view-models/interfaces';
import { WaiterCockpitService } from '../services/waiter-cockpit.service';
import { OrderDialogComponent } from '../order-cockpit/order-dialog/order-dialog.component';
import {FormControl} from '@angular/forms';
@Component({
  selector: 'app-order-archive',
  templateUrl: './order-archive.component.html',
  styleUrls: ['./order-archive.component.scss']
})
export class OrderArchiveComponent implements OnInit {
  private translocoSubscription = Subscription.EMPTY;
  private pageable: Pageable = {
    pageSize: 8,
    pageNumber: 0,
    // total: 1,
  };
  private sorting: any[] = [];

  pageSize = 8;

  @ViewChild('pagingBar', { static: true }) pagingBar: MatPaginator;

  orders: OrderListView[] = [];
  totalOrders: number;

  columns: any[];
  states: any[];

  displayedColumns: string[] = [
    'booking.bookingDate',
    'booking.email',
    'booking.bookingToken',
    'booking.state', //abd
  ];

  pageSizes: number[];

  filters: FilterCockpit = {
    bookingDate: undefined,
    email: undefined,
    bookingToken: undefined,
  };
  

  constructor(
    private dialog: MatDialog,
    private translocoService: TranslocoService,
    private waiterCockpitService: WaiterCockpitService,
    private configService: ConfigService,
  ) {
    this.pageSizes = this.configService.getValues().pageSizes;
  }

  ngOnInit(): void {
    this.applyFilters();
    this.translocoService.langChanges$.subscribe((event: any) => {
      this.setTableHeaders(event);
      moment.locale(this.translocoService.getActiveLang());
    });
  }

  setTableHeaders(lang: string): void {
    this.translocoSubscription = this.translocoService
      .selectTranslateObject('cockpit.table', {}, lang)
      .subscribe((cockpitTable) => {
        this.columns = [
          { name: 'booking.bookingDate', label: cockpitTable.reservationDateH },
          { name: 'booking.email', label: cockpitTable.emailH },
          { name: 'booking.bookingToken', label: cockpitTable.bookingTokenH },
          { name: 'booking.state', label: cockpitTable.stateH }, //abd
        ];
      });
      this.translocoSubscription = this.translocoService
      .selectTranslateObject('cockpit.states', {}, lang)
      .subscribe((cockpitTable) => {
        this.states = [
          { name: 'orderTaken', label: cockpitTable.orderTakenH },
          { name: 'deliveringOrder', label: cockpitTable.deliveringOrderH },
          { name: 'orderDelivered', label: cockpitTable.orderDeliveredH },
          { name: 'orderPaid', label: cockpitTable.orderPaidH },
          { name: 'canceled', label: cockpitTable.canceledH } //abd
        ];
      });
  }

  applyFilters(): void {
    this.waiterCockpitService
      .getOrders(this.pageable, this.sorting, this.filters)
      .subscribe((data: any) => {
        if (!data) {
          this.orders = [];
        } else {
          this.orders = [];
          for (let entry of data.content) {
            if (entry.order.state == "canceled" || entry.order.state == "orderPaid") {
              this.orders.push(entry);
            }
          }
        }
        this.totalOrders = this.orders.length;
      });
  }

  clearFilters(filters: any): void {
    filters.reset();
    this.applyFilters();
    this.pagingBar.firstPage();
  }

  page(pagingEvent: PageEvent): void {
    this.pageable = {
      pageSize: pagingEvent.pageSize,
      pageNumber: pagingEvent.pageIndex,
      sort: this.pageable.sort,
    };
    this.applyFilters();
  }

  sort(sortEvent: Sort): void {
    this.sorting = [];
    if (sortEvent.direction) {
      this.sorting.push({
        property: sortEvent.active,
        direction: '' + sortEvent.direction,
      });
    }
    this.applyFilters();
  }
  
  selected(selection: OrderListView): void {
    this.dialog.open(OrderDialogComponent, {
      width: '80%',
      data: selection,
    });
  
  }

  ngOnDestroy(): void {
    this.translocoSubscription.unsubscribe();
  }
}
