import { Component, OnInit, AfterViewChecked, NgZone } from '@angular/core';
import { NavController, LoadingController, Alert, AlertController } from 'ionic-angular';
import { AuthService } from '../../app/_services/auth.service';
import { TasksService } from '../../app/_services/tasks.service';
import { Runner } from '../../app/_models/runner';
import { RunnerTask } from '../../app/_models/runner-task';
import { TaskDetailPage } from '../task-detail/task-detail';
import { GeoService } from '../../app/_services/geo.service';

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
    public authService: AuthService,
    private tasksService: TasksService,
    private geoService: GeoService,
    public loadingCtrl: LoadingController,
    public _alertCtrl: AlertController, 
    private zone: NgZone) {
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

    this.runner = JSON.parse(localStorage.getItem('user')); 
    console.log(' HomePage -> ngOnInit -> this.runner', this.runner);

    // this.geoService.runnerTracking.subscribe(rt => {
    // console.log(' HomePage -> ngOnInit -> rt', rt);
    //   this.isAvailable = rt.available;
    // console.log(' HomePage -> ngOnInit -> this.isAvailable', this.isAvailable);            
    // });
    
    this.doRefresh(0);
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
    console.log(' HomePage -> ionViewWillEnter -> this.updateInterval', this.updateInterval);
    console.log(' HomePage -> ionViewWillEnter -> this.isAvailable', this.isAvailable);
    
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
    console.log(' HomePage -> doRefresh -> this.tasks', this.tasks);
    this.tasksSubscription = this.tasksService.runnerTasks
      .subscribe( tsks => {     
        if (tsks && tsks.length > 0) {
          tsks.forEach(tsk => tsk.startAt = new Date(tsk.startAt.seconds * 1000));
          this.tasks = tsks; 
          console.log(' HomePage -> doRefresh -> this.tasks', this.tasks);
        }  
      });
    // let tasksSubscription = this.tasksService.runnerTasks.subscribe( rts => {
    //   this.tasks = rts;      
    // });
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

