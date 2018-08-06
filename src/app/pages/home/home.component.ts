import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import 'rxjs/Rx';
import { Observable } from 'rxjs/Rx';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { DataStoreService } from '../../services/data-store.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  chart = [];
  currentDate: string = '';
  currentTime: string = '';
  lastUpdated: string[] = [];
  voltage: string = '';
  accWArray: {
    date: string,
    temp: string,
    pressure: string,
    humidity: string,
    wSpeed: string,
    wDir: string,
  }[] = []

  parameters: object[] = [
    { parameter: 'Wind direction', icon: 'assets/icons/wd.png', value: '' },//0
    { parameter: 'Wind speed', icon: 'assets/icons/ws.png', value: '' }, //1
    { parameter: 'Pressure', icon: 'assets/icons/pr.png', value: '' },//2
    { parameter: 'Temperature', icon: 'assets/icons/temp.png', value: '' },//3
    { parameter: 'Relative Humidity', icon: 'assets/icons/hum.png', value: '' },//4  
    { parameter: 'Prev. Rainfall', icon: 'assets/icons/rf.png', value: '' },//5
    { parameter: 'Cum. Rainfall', icon: 'assets/icons/crf.png', value: '' },//6
    { parameter: 'Solar Radiation', icon: 'assets/icons/sr.png', value: '' },//7


  ];

  //'Wind Direction', 'Wind Speed', 'Pressure', 'Rainfall', 'Cum. Rainfall','Temp','Hum'
  currentParam: string = "PM10";

  graphData = {
    labels: ['Feb 22', 'Feb 23', 'Feb 24', 'Feb 25', 'Feb 26', 'Feb 27', 'Feb 28', 'Mar 1', 'Mar 2', 'Mar 3', 'Mar 4']
  }

  // weatherDates = ['3rd March', '4th March', '5th March', '6th March'];

  constructor(
    public _http: HttpClient,
    public _dataStoreService: DataStoreService) {

  }

  ngOnInit() {
    this.initializeChart();
    this.getCurrentTime().subscribe((time) => {
      this.currentDate = time.split(",")[0];
      this.currentTime = time.split(",")[1];
      this._dataStoreService.date_time_subject.next({
        currentDate: time.split(",")[0],
        currentTime: time.split(",")[1]
      })
    });
    this.startPolling().subscribe((apiData) => {
      this.lastUpdated = [apiData['msg'][8], apiData['msg'][9]];

      for (var index in this.parameters) {
        this.parameters[index]['value'] = apiData['msg'][index];
      }
      //to send last updated date time values in header component
      this._dataStoreService.last_updated_dt_subject.next({ lastUpdated: apiData['msg'][8] + ' ' + apiData['msg'][9] });
    });

    //ACCUWEATHER CALL FOR FORECAST
    this.forecast().subscribe((response) => {
      this.accWArray = [];
      for (var i = 0; i < 5; i++) {
        var day = moment().add(i, 'days').format('YYYY-MM-DD') + ' 12:00:00';
        for (var j = 0; j < response['list'].length; j++) {
          if (response['list'][j]['dt_txt'] === day) {
            let dataObj = {
              date: moment(response['list'][j]['dt_txt'].split(' ')[0]).format('MMM Do YY'),
              temp: String((Number(response['list'][j]['main']['temp']) - 273.15).toFixed(2)),
              humidity: response['list'][j]['main']['humidity'],
              pressure: response['list'][j]['main']['pressure'],
              wSpeed: response['list'][j]['wind']['speed'],
              wDir: this.wd_EWNS(response['list'][j]['wind']['deg']),
            }
            this.accWArray.push(dataObj);
          }
        }
      }
    })
  }

  wd_EWNS(value) {
    value = Math.floor(value);
    if (value < 22)
      return value + " N";
    else if (value < 67)
      return value + " NE";
    else if (value < 112)
      return value + " E";
    else if (value < 157)
      return value + " SE";
    else if (value < 212)
      return value + " S";
    else if (value < 247)
      return value + " SW";
    else if (value < 292)
      return value + " W";
    else if (value < 337)
      return value + " NW";
    else return value + " N";
  }

  startPolling() {
    return Observable.timer(0, 5000).flatMap(() => this._http.get('http://customer.enggenv.com/retvalue.php?device-id=WMS_AMU_02'))
  }

  forecast() {
    return Observable.timer(0, 5000).flatMap(() => this._http.get('http://api.openweathermap.org/data/2.5/forecast?q=Aligarh,IN&APPID=d2ca3a96972adb765a932f860e447ac8'))
  }

  getCurrentTime() {
    return Observable.interval(1000).map(() => moment().format('MMMM Do YYYY, h:mm:ss a'));
  }


  initializeChart() {
    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: ['Mar 2', 'Mar 3', 'Mar 4', 'Mar 5'],
        datasets: [
          {
            data: ['30', '34', '45', '45'],
            borderColor: "#3cba9f",
            fill: false
          }

        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            display: true
          }],
        }
      }
    });
  }

  onTileClick(index: number) {
    // console.log(index)
    // this.currentParam = this.parameter[index]
  }

}


