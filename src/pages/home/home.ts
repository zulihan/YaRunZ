import { Component, OnInit, AfterViewChecked, NgZone } from '@angular/core';
import { NavController, LoadingController, Alert, AlertController, Platform } from 'ionic-angular';
import { AuthService } from '../../app/_services/auth.service';
import { TasksService } from '../../app/_services/tasks.service';
import { Runner } from '../../app/_models/runner';
import { RunnerTask } from '../../app/_models/runner-task';
import { TaskDetailPage } from '../task-detail/task-detail';
import { GeoService } from '../../app/_services/geo.service';
import { ConvertersService } from '../../app/_helpers/converters.service';

import { FcmProvider } from '../../providers/fcm/fcm';
import { ToastController } from 'ionic-angular';
import { tap } from 'rxjs/operators';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit, AfterViewChecked {
  isAvailable: boolean;
  runner: Runner;
  tasks: RunnerTask[] = [];
  params: any;
  tasksSubscription;
  loading;
  
  updateInterval;      

  _alert: Alert;

  constructor(
    public navCtrl: NavController,
    private platform: Platform,
    private authService: AuthService,
    private tasksService: TasksService,
    private geoService: GeoService,
    public loadingCtrl: LoadingController,
    public _alertCtrl: AlertController,
    private convert: ConvertersService, 
    private zone: NgZone,
    private fcm: FcmProvider,
    private toastCtrl: ToastController) {
      this._alert = this._alertCtrl.create({
        'title': "Error",
        'message': "'Couldn't update your tracking status, please retry when you have a connection.'",
        buttons: ['OK']
      });
  }

  ngOnInit() {
    // this.isAvailable = this.geoService.isAvailable;
    // this.runner = this.authService.currentUser;
    // this.tasksService.getRunnerTasks();
    console.log(' HomePage -> ngOnInit -> this.convert', this.convert);

    this.runner = JSON.parse(localStorage.getItem('user'));
    console.log(' HomePage -> ngOnInit -> this.runner', this.runner);
    
    // this.geoService.runnerTracking.subscribe(rt => {
    // console.log(' HomePage -> ngOnInit -> rt', rt);
    //   this.isAvailable = rt.available;
    // console.log(' HomePage -> ngOnInit -> this.isAvailable', this.isAvailable);            
    // });
    
    this.doRefresh(0);
  }

  ionDidLoad() {
    this.platform.ready().then(() => {
      // Get a FCM token
        this.fcm.getToken()
          .then( res => console.log(' MyApp -> getToken'));
          // Listen to incoming messages
        this.fcm.listenToNotifications().pipe(
          tap(msg => {
          // show a toast
            const toast = this.toastCtrl.create({
            message: msg.body,
            duration: 1000000,            
            position: 'top',
            cssClass: 'toast',
            showCloseButton: true
            });
            toast.present();
          })
        )
        .subscribe();
      });
  }

  ngAfterViewChecked() {}

  ionViewWillEnter() {  

    this.geoService.runnerTracking.subscribe(rt => {
      console.log(' HomePage -> ionViewWillEnter -> rt', rt);
      this.isAvailable = rt.available;
      console.log(' HomePage -> ionViewWillEnter -> this.isAvailable', this.isAvailable);
      console.log(' HomePage -> ionViewWillEnter -> this.updateInterval', this.updateInterval);
      if (this.isAvailable === false && this.updateInterval !== undefined) {
        clearInterval(this.updateInterval);
      } else if (this.isAvailable) {
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.updateInterval = setInterval( () => {
          this.geoService.updatePosition(this.isAvailable);
          console.log(' HomePage -> this.updateInterval -> position udpdated');
        }, 60000)
      }      
    });  
  }

  ionViewDidEnter() {
    console.log(' HomePage -> ionViewDidEnter -> ionViewDidEnter()');
    if (this.isAvailable === false && this.updateInterval !== undefined) {
      clearInterval(this.updateInterval);
    }
    
  }

  buttonClick(task) {
    const available = this.isAvailable;
    this.navCtrl.push(TaskDetailPage, { task, available });
  }

  // goBack() {
  //   console.log("popping");
  //   this.navCtrl.pop();
  // }

  doRefresh(refresher) {
    this.tasksSubscription = this.tasksService.getRunnerTasks()
      .subscribe( tsks => {        
        if (tsks && tsks.length > 0) {
          tsks.forEach(tsk => {
            console.log(' HomePage -> doRefresh -> tsk', tsk);
            tsk.startAt = tsk.startAt.toDate();
            // tsk.startAt = new Date(tsk.startAt.seconds * 1000);
            // tsk.distance = (tsk.distance / 1000).toFixed(1) + ' km';
            // tsk.estimatedDuration = tsk.estimatedDuration !== undefined ? this.convertSecondsToHrsMinsSec(tsk.estimatedDuration) : '';
          });
          this.tasks = tsks;
          this.tasks.forEach(tsk => {
            tsk.distanceToKm = (tsk.distance / 1000).toFixed(1) + ' km';
            tsk.durationToTime = tsk.estimatedDuration !== undefined ? this.convert.secondsToHrsMinsSec(tsk.estimatedDuration) : '';
          })
          console.log(' HomePage -> doRefresh -> this.tasks3', this.tasks);
        }
        this.tasks = tsks;
      });
    // let tasksSubscription = this.tasksService.runnerTasks.subscribe( rts => {
    //   this.tasks = rts;      
    // });
    console.log(' HomePage -> doRefresh -> refresher', refresher);
    if (refresher !== 0) refresher.complete();
  }

  updateAvailable(event) {
    if (this.loading) this.dismissLoading();
    console.log(' HomePage -> updateAvailable -> event.value', event.value);    
    this.showLoading();
    this.zone.run(() => {
      if (event.value === false ) {
        console.log(' HomePage -> updateAvailable -> this.updateInterval', this.updateInterval);
        clearInterval(this.updateInterval);
        this.updateInterval = 0;
        console.log(' HomePage -> updateAvailable -> this.updateInterval2', this.updateInterval);        
      }
      this.geoService.updatePosition(event.value)
        .then( val => {          
          this.dismissLoading(); 
          // if (event.value === true) {
          //   this.updateInterval = setInterval( () => {
          //     this.geoService.updatePosition(this.isAvailable).then( () => {
                
          //     })
          //     console.log('position udpdated');
          //     console.log(' HomePage -> updateAvailable -> this.updateInterval3', this.updateInterval);
          //     if (event.value === false ) {
          //       console.log('updateAvailable(event) this.updateInterval4', this.updateInterval);
          //       clearInterval(this.updateInterval);
          //       this.updateInterval = 0;
          //       console.log(' HomePage -> updateAvailable -> this.updateInterval5', this.updateInterval);        
          //     }
          //   }, 50000);
          // } 
          console.log(' HomePage -> updateAvailable -> this.updateInterval6', this.updateInterval);      
        })
        .catch(error => {
          this.dismissLoading();
          console.log(' HomePage -> updateAvailable -> error', error);
          this._alert.present();
        }); 
    });  
  }

  showLoading() {
    if(!this.loading){
      this.loading = this.loadingCtrl.create({
        content: 'Updating tracking status...'        
      });
        this.loading.present();
    }
  }

  dismissLoading(){
      if(this.loading){
          this.loading.dismiss();
          this.loading = null;
      }
  } 

}


// dismissOnPageChange: true
// this.loading.present().then( () => {
//   this.geoService.updatePosition(event.value)
//   .then( val => {
//     this.loading.dismiss();
//   })
//   .catch(error => {
//     this.loading.dismiss();
//     console.log('updateAvailable() error: ', error);
//     this._alert.present();
//   });
// });  

