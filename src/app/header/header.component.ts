import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataStoreService } from '../services/data-store.service';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  date_time_subscription: Subscription;
  last_updated_subscription: Subscription;
  date_time: { currentDate: string, currentTime: string };
  last_updated: string;
  //voltage_data: object;
  constructor(
    public _dataStoreService: DataStoreService
  ) { }

  ngOnInit() {
    this.date_time_subscription = this._dataStoreService.date_time_subject.subscribe((data) => {
      this.date_time = data;
    });

    this.last_updated_subscription = this._dataStoreService.last_updated_dt_subject.subscribe((response) => {
      this.last_updated = response.lastUpdated;
    })
  }

  ngOnDestroy() {
    this.date_time_subscription.unsubscribe();
    this.last_updated_subscription.unsubscribe();
  }

}
