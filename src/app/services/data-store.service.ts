import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';



@Injectable()

export class DataStoreService {


  date_time_subject = new Subject<{ currentDate: string, currentTime: string }>();
  last_updated_dt_subject = new Subject<any>();
  
  constructor() { }



}
