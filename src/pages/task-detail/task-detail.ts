import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, DoCheck, AfterViewChecked, ViewContainerRef, TemplateRef } from '@angular/core';
import { NavController, NavParams, Platform, ModalController, IonicPage, Navbar } from 'ionic-angular';

import {style, state, animate, transition, trigger} from '@angular/animations';

import { MapModalPage } from '../map-modal/map-modal';

import { AuthService } from '../../app/_services/auth.service';
import { TasksService } from '../../app/_services/tasks.service';
import { RunzService } from '../../app/_services/runz.service';

import { Runner } from '../../app/_models/runner';
import { MapComponent } from '../../app/map/map.component';
import { GeoService } from '../../app/_services/geo.service';
    
declare var google;

@Component({
  selector: 'task-detail',
  templateUrl: 'task-detail.html',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [
          style({opacity: 0}),
          animate('800ms', style({opacity: 1}))
        ]),
        transition(':leave', [
          style({transform: 'translateY(0)', opacity: 1}),
          animate('300ms', style({transform: 'translateY(-100%)', opacity: 0}))
        ])
      ]
    ),
    trigger(
      'cursorMoveLeft', [
        state('false', style({

        })),
        state('true', style({
          left: '0%'
        })),
        transition(
          'false => true', animate(200)
        )
      ]
    )
  ],
})
export class TaskDetailPage implements OnInit, AfterViewInit, AfterViewChecked {

  @ViewChild('ctaList') ctaElement: ElementRef;
  @ViewChild('myTemplate') myTemplate: ElementRef;
  @ViewChild('map') map: MapComponent;
  @ViewChild('Navbar') navBar: Navbar;

  isAvailable;
  available: boolean;
  runner: Runner;
  task: any;
  taskLocations = [];

  cursor;
  cursorMoveLeft = false;  
  rangeBar;
  activeBar;
  // rangeBarActive = this.rangeBarActiveElts;
  rangeKnobHandle;
  ctaTextElement;
  ctaText = '';
  ctaTextCompleted;  

  showMap = true;
  map_canvas;
  mapConfig = 'detail-page';

  modalOpened = false;

  legs = 2; 

  runnerPosition;
  directionsService;
  calculatePercentageDoneInterval;
  totalDistance;
  updatedDistance;
  updatedDuration;
  percentageDone;
  totalPercentageDone;

  startConfirmValue;
  started = false;

  OneOfTwoCompletedConfirmValue;
  oneOfTwoCompleted = false;

  twoOfTwoStartedConfirmValue;
  twoOfTwoStarted = false;

  twoOfTwoCompletedConfirmValue;
  twoOfTwoCompleted = false;

  confirmed = false;

  rideData;

  // Progress Bar
  pbOptions = {
    color: '#00acc1',
    mode: 'indeterminate',
    value: 10,
    bufferValue: 100,
  }


  constructor(
    private platform: Platform,
    public navCtrl: NavController,
    public navParams: NavParams,
    private modal: ModalController,
    private authService: AuthService,
    private tasksService: TasksService,
    private runzService: RunzService,
    private geoService: GeoService) {

    this.task = navParams.data.task;  
    this.taskLocations.push(this.task.from);    
    this.taskLocations.push(this.task.to);
    this.available = navParams.data.available;
    this.directionsService = new google.maps.DirectionsService();
  }

  ngOnInit() {
    console.log('********this params: **************', this.task);
  if( this.isAvailable == undefined) this.isAvailable = this.available;
  console.log('********ngOnInit() this.available: **************',  this.available);
}

  ngAfterViewInit() {
    console.log('map_canvas: ', this.map_canvas);
    this.checkTaskStatusUpdateView(this.task.status);
    this.updateCTAText(this.task.status);
    console.log('this.ctaElement.nativeElement: ', this.ctaElement); 
    console.log('ngAfterViewInit() this map.initialDirections: ', this.map.initialDirections);
    // this.isAvailable = this.geoService.isAvailable;
    console.log('this.isAvailable: ', this.isAvailable);    
  }

  ionViewDidLoad() {
  console.log('ionViewDidLoad() this.ctaText: ', this.ctaText);
  console.log('ionViewDidLoad() this map.initialDirections: ', this.map.initialDirections);
  this.platform.ready().then( () => {  
      console.log('ionViewDidLoad() this map.taskStatus: ', this.map.taskStatus);
      console.log('ionViewDidLoad()2 this map.initialDirections: ', this.map.initialDirections);
    
      setTimeout( () => {

        console.log('ionViewDidLoad()3 this map.initialDirections: ', this.map.initialDirections);                    
      }, 2000)
    })
  }

  ionViewWillEnter() {
    console.log('%%%%% is.Available %%%%%%: ', this.isAvailable);
    this.geoService.getStatus().subscribe(rt => {
      console.log('%%%%% is.Available %%%%%%: ', rt);
      return this.isAvailable = rt.available;
    })
  }

  ionViewDidEnter() {
    this.runnerPosition = this.map.runnerPosition;
    // this.totalDistance = ;
  }

  ngAfterViewChecked() {
    if( this.task.status !== 'has completed') this.updateCTAText(this.ctaText);
  }
  

  checkTaskStatusUpdateView(status) {    
    console.log('this.ctaText: ', this.ctaText);
    this.ctaText = '';
    switch(status) {
      case 'has not started yet':
        this.started = false;
        this.pbOptions.value = 0;
        this.pbOptions.mode = 'indeterminate';
        this.ctaText = 'START 1/2 ';        
        break;
      case 'has started':
        this.started = true;
        this.pbOptions.value = 15;  // this.updatePBValue();
        this.pbOptions.mode = 'determinate';
        this.task.status = 'has started';
        this.task.taskStatus = 'ok';
        this.ctaText = 'COMPLETE 1/2 ';        
        break;
      case 'has arrived at destination':
        this.started = true;
        this.oneOfTwoCompleted = true;
        this.pbOptions.value = 100;
        this.pbOptions.mode = 'indeterminate';
        this.task.status = 'has arrived at destination';
        this.task.taskStatus = 'ok';
        this.ctaText = 'START 2/2 ';
        break;
      case 'is on the way back':
        this.started = true;
        this.oneOfTwoCompleted = true;
        this.twoOfTwoStarted = true;
        this.pbOptions.value = 5;
        this.pbOptions.mode = 'determinate';
        this.task.status = 'is on the way back';
        this.task.taskStatus = 'ok';
        this.ctaText = 'COMPLETE 2/2 ';
        break;
      case 'has completed':
        this.started = true;
        this.oneOfTwoCompleted = true;
        this.twoOfTwoStarted = true;
        this.twoOfTwoCompleted = true;
        this.pbOptions.value = 100;
        this.pbOptions.mode = 'determinate';
        this.task.status = 'has completed';
        this.task.taskStatus = 'ok';
    }
    console.log('this.ctaText: ', this.ctaText);   
  }

  updateStatus(confirmValue, text?) {
    console.log('this.started1: ', this.started) ;
    console.log(confirmValue);
    console.log(text);
    // this.cursor = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[2];
    // this.activeBar = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[1];
    if (confirmValue >= 80) {      
      setTimeout( () => {
        if (text === 'has completed') {
          this.task.isDone = true;
        }
        this.isAvailable = true;
        this.task.updatedAt = new Date(Date.now()).getTime();
        this.checkTaskStatusUpdateView(text);
        this.updateDataAndView();
        // let rideData = this.returnRideData(text);
        console.log('this.ctaText: ', this.ctaText);
        // this.calculatePercentageDoneInterval = setInterval( () => {
        //   this.calculatePercentageDone(this.runnerPosition, this.task.type)
        // }, 2000);                    
      }, 800);        
    } else {
      setTimeout( () => {
        if (confirmValue > 0 && confirmValue < 80 ) {
          this.moveCursorAndActiveBarLeft();
        }
      },400);
    }        
    
  }
  

  updateDataAndView() {
    this.tasksService.updateRunnerTask(this.task.id, this.task )
      .then( response => {
        console.log('response from updateRunnerTask', response);
        console.log('this.started: ', this.started); 
        this.geoService.updatePosition(this.isAvailable);                
        
        if (!this.twoOfTwoCompleted) {
          setTimeout( () => {                 
            this.moveCursorAndActiveBarLeft(); 
            // this.updateCTAText(this.ctaText);                
            this.map.resolveRoute(this.task.status);                                  
            this.map.returnDirections(this.task.status, this.map.route);                                  
            this.map.displayRoute(this.map.directions);                                  
          },200);
          setTimeout( () => {
            console.log('this.rideData: ', this.map.rideData);         
            console.log('this.rideData: ', this.rideData);              
            if(this.rideData === undefined) {
              this.rideData = this.map.rideData;
              this.runzService.updateRun(this.rideData);
              this.rideData = undefined;
            }                  
          },1500);
        }
        
        // if (text === 'has started') {
        //   this.runzService.runInit(this.legs, this.task)
        //   .then( response => console.log('response from runzService.runInit: ', response));
        // };                      
      });
    
    console.log('this legs :', this.legs);
  }

  // calculatePercentageDone(position, taskType) {
  //   this.runnerPosition = this.map.runnerPosition;
  //   let route = {};
  //   let distance;
  //   let duration;
  //   if (taskType === 'drop off' && this.task.status === 'has started') {
  //     distance = this.rideData.legs.one.distance;
  //     duration = this.rideData.legs.one.duration;        
  //     route = {
  //       origin: this.runnerPosition,
  //       destination: new google.maps.LatLng(this.task.to.coord.latitude, this.task.to.coord.longitude),          
  //       travelMode: 'DRIVING'
  //     };
  //   } else if (taskType === 'drop off' && this.task.status === 'is on the way back') {
  //     distance = this.rideData.legs.two.distance;
  //     duration = this.rideData.legs.two.duration;        
  //     route = {
  //       origin: this.runnerPosition,
  //       destination: new google.maps.LatLng(this.task.from.coord.latitude, this.task.from.coord.longitude),          
  //       travelMode: 'DRIVING'
  //     };
  //   }
  //   this.directionsService.route(route,
  //     (response, status) => {
  //       if (status === 'OK') {
  //         console.log("response from this.directionsService.route: ", response);        
  //         this.updatedDistance = response.routes[0].legs[0].distance;
  //         this.updatedDuration = response.routes[0].legs[0].duration;
  //         this.percentageDone = (( distance - this.updatedDistance ) * 100) / distance;
  //         this.totalPercentageDone = (( distance - this.updatedDistance ) * 100) / this.totalDistance;
  //         let updatedRideData = {
  //           "percent_dist_travelled": this.percentageDone / 2,
  //           "legs.one": {
  //             "percent_dist_travelled": this.percentageDone
  //           }
  //         }
  //       } else {
  //         window.alert('Directions request failed due to ' + status);
  //       }
  //     })
  // }

  updatePBValue(): number {
    // this.pbOptions.value = ;
    return 5;
  }

  updateCTAText(text) {
                                       // nativeElement.children[""0""].children[""0""].children[""0""].children[""0""].children[""0""].children[""0""]
    this.ctaTextElement = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"];
    this.ctaTextElement.textContent = text;
  }

  moveCursorAndActiveBarLeft() {
    this.activeBar =  this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[1];
    this.cursor =     this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[2];
    this.cursorMoveLeft = true;
    this.cursor.style.left = '0%';
    this.activeBar.style.right = '100%';
    console.log('this.cursor: ', this.cursor);
    console.log('this.cursor.style.left: ', this.cursor.style.left);
    console.log('this.activeBar.style.right: ', this.activeBar.style.right);
  }

  
}


  // ctaUpdateStatus() {
  //   console.log('this.ctaElement: ', this.ctaElement);
  //   console.log('after view Init');
  //   this.cursor = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[2];
  //   this.activeBar = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[1];
  //   this.ctaText = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"];
    
  //   switch(this.task.status) {
  //     case 'has not started yet':
  //       this.ctaText.textContent = 'START';      
  //       console.log('this cursor: ', this.cursor);
  //       break;
  //     case 'has started':
  //       this.ctaText.textContent = 'COMPLETE 1/2 ';
  //       break;
  //     case 'has arrived at destination':
  //       this.ctaText.textContent = 'START 2/2 ';
  //       break;
  //     case 'is on the way back':
  //       this.ctaText.textContent = 'COMPLETE 2/2 ';            
  //   }    
  //   this.map.calculateAndDisplayRoute(this.task.status);
  // }

  


// updateStatus(confirmValue, text) {
     
//   console.log(confirmValue);
//   console.log(text);
//   this.cursor = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[2];
//   this.activeBar = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[1];
//   if (confirmValue >= 80) {
//     let ctaText = '';
//     switch(text) {
//       case 'has started':
//       this.task.status = 'has started';
//       this.task.taskStatus = 'ok';
//       ctaText = 'COMPLETE 1/2 ';
//       this.started = true;      
//       break;
//       case 'has arrived at destination':
//       this.task.status = 'has started';
//       this.task.taskStatus = 'ok';
//       ctaText = 'START 2/2 ';
//       break;
//       case 'is on the way back':
//       this.task.status = 'COMPLETE 2/2';
//       this.task.taskStatus = 'ok';               
//     }
//       this.task.updatedAt = new Date(Date.now()).getTime();
//       setTimeout( () => {        
//         this.tasksService.updateRunnerTask(this.task.id, this.task );
//         console.log('this legs :', this.legs);
//         if (text === 'has started') this.runzService.runInit(this.legs, this.task)
//           .then( response => console.log(response));
//         this.map.calculateAndDisplayRoute(this.task.status);
//         setTimeout( () => {
//           console.log('this.ctaElement from updateOneOfTwoStartedConfirmValue :', this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"]);
//           this.updateCTAText(ctaText);
//         },200);
//         this.moveCursorAndActiveBarLeft();
//       }, 800)
    
//     setTimeout( () => console.log('this.started: ', this.started), 1200 );
//   } 

//   setTimeout( () => {
//     if (confirmValue > 0 && confirmValue < 80 ) {
//       this.moveCursorAndActiveBarLeft();
//     }
//   },
//   400)      
  
// }


