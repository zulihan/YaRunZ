import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, DoCheck, AfterViewChecked, ViewContainerRef, TemplateRef } from '@angular/core';
import { NavController, NavParams, Platform, ModalController, IonicPage, Navbar } from 'ionic-angular';

import {style, state, animate, transition, trigger} from '@angular/animations';

// import { MapModalPage } from '../map-modal/map-modal';

import { AuthService } from '../../app/_services/auth.service';
import { TasksService } from '../../app/_services/tasks.service';
import { RunzService } from '../../app/_services/runz.service';
import { GeoService } from '../../app/_services/geo.service';

import { Runner } from '../../app/_models/runner';
import { MapComponent } from '../../app/map/map.component';

import { TaskStatus, RunStatus, RunType } from "../../app/_enums/enums";
import { environment } from '../../environments/environment'

    
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

  FESTIVAL = environment.FESTIVAL;
  public runType = RunType;
  public runStatus = RunStatus;
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

  run;
  legs; 

  runnerPosition;
  directionsService;
  updatePositionInterval;
  totalDistance;
  updatedDistance;
  updatedDuration;
  percentageDone;
  totalPercentageDone;

  startConfirmValue;
  started = false;

  oneOfTwoCompletedConfirmValue;
  oneOfTwoCompleted = false;

  twoOfTwoStartedConfirmValue;
  twoOfTwoCompletedConfirmValue;
  twoOfTwoStarted = false;
  twoOfTwoCompleted = false;
  
  // twoOfTwoCompleted = false;

  oneOfThreeCompletedConfirmValue;
  oneOfThreeCompleted = false;

  twoOfThreeStarted = false;
  twoOfThreeStartedConfirmValue
  twoOfThreeCompletedConfirmValue;
  twoOfThreeCompleted = false;

  threeOfThreeStarted = false;
  threeOfThreeStartedConfirmValue;
  threeOfThreeCompletedConfirmValue;
  // threeOfThreeCompleted = false; 

  completed = false;

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
    console.log(' TaskDetailPage -> ngOnInit -> this.task', this.task);
    if( this.isAvailable === undefined) this.isAvailable = this.available;
    console.log(' TaskDetailPage -> ngOnInit -> this.available', this.available);
    let runId = this.task.runId;
    // this.run = this.runzService.getRun(runId);  
    // this.checkTaskStatusUpdateView(this.task.status, this.task.type);
}

  ngAfterViewInit() {
    console.log(' TaskDetailPage -> ngAfterViewInit -> this.map_canvas', this.map_canvas);
    this.updateCTAText(this.task.status);
    console.log(' TaskDetailPage -> ngAfterViewInit -> this.ctaElement', this.ctaElement);
    console.log(' TaskDetailPage -> ngAfterViewInit -> this.map.initialDirections', this.map.initialDirections);
    // this.isAvailable = this.geoService.isAvailable;
    console.log(' TaskDetailPage -> ngAfterViewInit -> this.isAvailable', this.isAvailable);
  }

  ionViewDidLoad() {
  console.log(' TaskDetailPage -> ionViewDidLoad -> this.ctaText', this.ctaText);
  console.log(' TaskDetailPage -> ionViewDidLoad -> this.map.initialDirections', this.map.initialDirections);
  this.platform.ready().then( () => {  
      console.log(' TaskDetailPage -> ionViewDidLoad -> this.map.taskStatus', this.map.taskStatus);
      console.log(' TaskDetailPage -> ionViewDidLoad -> this.map.initialDirections', this.map.initialDirections);
      this.checkTaskStatusUpdateView(this.task.status, this.task.type);
      if (this.updatePositionInterval) clearInterval(this.updatePositionInterval);

      this.map.resolveRoute(this.task.status, this.task.type, this.map.run);
      this.map.returnDirections(this.task.status, this.map.route);
      this.updatePBValue(this.task.status);

      setTimeout( () => {
        
        if (this.task.status === RunStatus.STARTED ||
            this.task.status === RunStatus.ON_THE_WAY_BACK ||
            this.task.status === RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION) {
            this.updatePositionInterval = setInterval( () => {
              console.log(' TaskDetailPage -> this.updatePositionInterval -> updatePositionInterval', this.updatePositionInterval);
              this.map.resolveRoute(this.task.status, this.task.type, this.map.run);
              this.map.returnDirections(this.task.status, this.map.route);
              this.updatePBValue(this.task.status);
            }, 30000);
        }        
        console.log(' TaskDetailPage -> ionViewDidLoad -> this.map.initialDirections', this.map.initialDirections);
      }, 2000)
    })
  }

  ionViewWillEnter() {
    console.log(' TaskDetailPage -> ionViewWillEnter -> this.isAvailable', this.isAvailable);
    this.geoService.getStatus().subscribe(rt => {
      console.log(' TaskDetailPage -> ionViewWillEnter -> rt', rt);
      return this.isAvailable = rt.available;
    })
  }

  ionViewDidEnter() {
    this.runnerPosition = this.map.runnerPosition;
    // this.totalDistance = ;
    this.updatePBValue(this.task.status);    
    console.log(' TaskDetailPage -> ionViewDidEnter -> this.updatePBValue');
  }

  ngAfterViewChecked() {
    if( this.task.status !== 'has completed') this.updateCTAText(this.ctaText);
  }  

  ionViewWillLeave() {
    console.log(' TaskDetailPage -> ionViewWillLeave -> this.updatePositionInterval', this.updatePositionInterval);
  }

  ionViewDidLeave() {
    clearInterval(this.updatePositionInterval);
  }

  checkTaskStatusUpdateView(status, runType) {    
    console.log('§§§§§§§§§§ TaskDetailPage -> checkTaskStatusUpdateView -> status', status);
    console.log(' TaskDetailPage -> checkTaskStatusUpdateView -> this.ctaText', this.ctaText);
    this.ctaText = '';
    switch(status) {
      case RunStatus.NOT_STARTED:
        this.started = false;
        this.pbOptions.value = 0;
        this.pbOptions.mode = 'indeterminate';
        this.ctaText = runType !== RunType.THREELEGS ? 'START 1/2 ' : 'START 1/3 ';        
        break;
      case RunStatus.STARTED:
        this.started = true;    
        this.pbOptions.value = 15;  // this.updatePBValue();
        this.pbOptions.mode = 'determinate';
        this.task.status = RunStatus.STARTED;
        this.task.taskStatus = TaskStatus.OK;
        this.ctaText = runType !== RunType.THREELEGS ? 'COMPLETE 1/2 ': 'COMPLETE 1/3 ';        
        break;
      case RunStatus.ARRIVED_AT_DESTINATION:
        this.started = true;
        if (runType !== RunType.THREELEGS) {
          this.oneOfTwoCompleted = true;
          console.log(' %%%%%%%%%%%%%%%%%%%%%% TaskDetailPage -> checkTaskStatusUpdateView -> this.oneOfTwoCompleted', this.oneOfTwoCompleted);
        } else {
          this.oneOfThreeCompleted = true;
        };
        this.pbOptions.value = 100;
        this.pbOptions.mode = 'indeterminate';
        this.task.status = RunStatus.ARRIVED_AT_DESTINATION;
        this.task.taskStatus = TaskStatus.OK;
        this.ctaText = runType !== RunType.THREELEGS ? 'START 2/2 ': 'START 2/3 ';
        break;
      
      case RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION:
        this.started = true;
        this.oneOfThreeCompleted = true;
        this.twoOfThreeStarted = true;
        this.pbOptions.value = 100;
        this.pbOptions.mode = 'indeterminate';
        this.task.status = RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION;
        this.task.taskStatus = TaskStatus.OK;
        this.ctaText = 'COMPLETE 2/3 ';
        break;
      case RunStatus.ARRIVED_AT_SECOND_DESTINATION:
        this.started = true;
        this.oneOfThreeCompleted = true;
        this.twoOfThreeStarted = true;
        this.twoOfThreeCompleted = true;
        this.pbOptions.value = 100;
        this.pbOptions.mode = 'indeterminate';
        this.task.status = RunStatus.ARRIVED_AT_SECOND_DESTINATION;
        this.task.taskStatus = TaskStatus.OK;
        this.ctaText = 'START 3/3 ';
        break;      
      case RunStatus.ON_THE_WAY_BACK:
        this.started = true;
        if (runType !== RunType.THREELEGS) {
          this.oneOfTwoCompleted = true;
          this.twoOfTwoStarted = true;
        } else {
          this.oneOfThreeCompleted = true;
          this.twoOfThreeStarted = true;
          this.twoOfThreeCompleted = true;
          this.threeOfThreeStarted = true;
        }        
        this.pbOptions.value = 5;
        this.pbOptions.mode = 'determinate';
        this.task.status = RunStatus.ON_THE_WAY_BACK;
        this.task.taskStatus = TaskStatus.OK;
        this.ctaText = runType !== RunType.THREELEGS ? 'COMPLETE 2/2': 'COMPLETE 3/3';
        break;
      case RunStatus.COMPLETED:
        this.started = true;
        this.completed = true;
        if (runType !== RunType.THREELEGS) {
          this.oneOfTwoCompleted = true;
          this.twoOfTwoStarted = true;
        } else {
          this.oneOfThreeCompleted = true;
          this.twoOfThreeStarted = true;
          this.twoOfThreeCompleted = true;
          this.threeOfThreeStarted = true;
        }
        this.pbOptions.value = 100;
        console.log(' ^^^^^^^^^^^^^^^^^^^^^^^^TaskDetailPage -> checkTaskStatusUpdateView -> this.pbOptions.value', this.pbOptions.value);
        this.pbOptions.mode = 'determinate';
        this.task.status = RunStatus.COMPLETED;
        this.task.taskStatus = TaskStatus.OK;
    }
    console.log(' TaskDetailPage -> checkTaskStatusUpdateView -> this.ctaText', this.ctaText);
  }

  updateStatus(confirmValue, text?) {
    console.log(' TaskDetailPage -> updateStatus -> this.started', this.started);
    console.log(' TaskDetailPage -> updateStatus -> confirmValue', confirmValue);
    console.log(' TaskDetailPage -> updateStatus -> text', text);
    // this.cursor = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[2];
    // this.activeBar = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[1];
    if (confirmValue >= 80) {      
      setTimeout( () => {
        if (text === RunStatus.COMPLETED) {
          this.task.isDone = true;
        }
        this.isAvailable = true;
        this.task.updatedAt = new Date(Date.now()).getTime();
        this.checkTaskStatusUpdateView(text, this.task.type);
        this.updateDataAndView();
        // let rideData = this.returnRideData(text);
        console.log('************* Refreshed ********** ');
        
        console.log(' TaskDetailPage -> updateStatus -> this.ctaText', this.ctaText);
        if (this.updatePositionInterval) clearInterval(this.updatePositionInterval);
        if( text !== RunStatus.COMPLETED) {
          this.map.resolveRoute(this.task.status, this.task.type);
          this.map.returnDirections(this.task.status, this.map.route);
          setTimeout( () => {
            this.updatePBValue(this.task.status);
            console.log(' *****************TaskDetailPage -> updateStatus -> this.updatePBValue');
          },2000)
          this.updatePositionInterval = setInterval( () => {
            console.log(' TaskDetailPage -> this.updatePositionInterval -> this.updatePositionInterval', this.updatePositionInterval);
            this.map.resolveRoute(this.task.status, this.task.type);
            this.map.returnDirections(this.task.status, this.map.route);
            setTimeout( () => this.updatePBValue(this.task.status), 2000) 
          }, 60000);
        } else if (text === RunStatus.COMPLETED) {
          clearInterval(this.updatePositionInterval);
        }
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
        console.log(' TaskDetailPage -> updateDataAndView -> response', response);
        console.log(' TaskDetailPage -> updateDataAndView -> this.started', this.started);
        this.geoService.updatePosition(this.isAvailable);                
        
        if (!this.completed) {
          setTimeout( () => {                 
            this.moveCursorAndActiveBarLeft(); 
            // this.updateCTAText(this.ctaText);                
            this.map.resolveRoute(this.task.status, this.task.type);                                  
            this.map.returnDirections(this.task.status, this.map.route);                                  
            this.map.displayRoute(this.map.directions);                                  
          },200);
          setTimeout( () => {
            console.log(' TaskDetailPage -> updateDataAndView -> this.map.rideData', this.map.rideData);
            console.log(' TaskDetailPage -> updateDataAndView -> this.rideData', this.rideData);
            if(this.rideData === undefined) {
              this.rideData = this.map.rideData;
              this.runzService.updateRun(this.map.runId, this.rideData);
              this.rideData = undefined;
            }
          },1500);
        }        
        // if (text === 'has started') {
        //   this.runzService.runInit(this.legs, this.task)
        //   .then( response => console.log('response from runzService.runInit: ', response));
        // };                      
      });
    
    console.log(' TaskDetailPage -> updateDataAndView -> this.legs', this.legs);
  }

  updatePBValue(taskStatus) {
    if (taskStatus === RunStatus.STARTED || taskStatus === RunStatus.ARRIVED_AT_DESTINATION) {
      this.pbOptions.value = this.map.legOnePercentageDistanceTravelled;
      console.log(' TaskDetailPage -> updatePBValue -> this.pbOptions.value', this.pbOptions.value);
    } else if (taskStatus === RunStatus.ON_THE_WAY_BACK) {
      this.pbOptions.value = this.map.legTwoPercentageDistanceTravelled;
      console.log(' TaskDetailPage -> updatePBValue -> this.pbOptions.value', this.pbOptions.value);
    } else if ( taskStatus === RunStatus.COMPLETED) {
      this.pbOptions.value = 100;
    } 
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
    console.log(' TaskDetailPage -> moveCursorAndActiveBarLeft -> this.cursor', this.cursor);
    console.log(' TaskDetailPage -> moveCursorAndActiveBarLeft -> this.cursor.style.left', this.cursor.style.left);
    console.log(' TaskDetailPage -> moveCursorAndActiveBarLeft -> this.activeBar.style.right', this.activeBar.style.right);
  }
  
}
