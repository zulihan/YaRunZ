import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, DoCheck, AfterViewChecked, ViewContainerRef, TemplateRef, OnDestroy } from '@angular/core';
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
import { ConvertersService } from '../../app/_helpers/converters.service';
import { Timestamp } from 'rxjs/internal-compatibility';
import { RunnerTask } from '../../app/_models/runner-task';
import { Observable, Subject } from 'rxjs/Rx';

    
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

  ngUnsubscribe = new Subject();
  updatePositionInterval;
  updatePositionIntervalSub;

  FESTIVAL = environment.FESTIVAL;

  // Enums
  public runType = RunType;
  public runStatus = RunStatus;

  isAvailable: boolean;
  available: boolean;

  runner: Runner;
  task: any;
  taskStatus: string;
  taskType: string;
  taskLocations = [];

  // Range bar
  cursor;
  cursorMoveLeft = false;  
  rangeBar;
  activeBar;
  rangeKnobHandle;
  ctaTextElement;
  ctaText = '';
  ctaTextCompleted;

  showMap = true;
  mapConfig = 'detail-page';

  modalOpened = false;

  run;
  legs; 

  runnerPosition;
  directionsService;  

  totalDistance;
  updatedDistance;
  updatedDuration;
  percentageDone;
  totalPercentageDone;

  startConfirmValue;
  started = false;
  startedAt;

  timeLeft;
  distanceLeft;
  distanceToNext;
  durationToNext;

  oneOfTwoCompletedConfirmValue;
  oneOfTwoCompleted = false;

  twoOfTwoStartedConfirmValue;
  twoOfTwoCompletedConfirmValue;
  twoOfTwoStarted = false;
  twoOfTwoCompleted = false;
  
  oneOfThreeCompletedConfirmValue;
  oneOfThreeCompleted = false;

  twoOfThreeStarted = false;
  twoOfThreeStartedConfirmValue
  twoOfThreeCompletedConfirmValue;
  twoOfThreeCompleted = false;

  threeOfThreeStarted = false;
  threeOfThreeStartedConfirmValue;
  threeOfThreeCompletedConfirmValue;
  threeOfThreeCompleted = false;

  completed = false;
  completedAt;

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
    private geoService: GeoService,
    private convert: ConvertersService) {

    this.task = navParams.data.task;  
    // console.log(' TaskDetailPage -> this.task', this.task);
    this.taskType = this.task.type;
    this.taskStatus = this.task.status;
    this.taskLocations.push(this.task.from, this.task.to);
    this.available = navParams.data.available;
    this.directionsService = new google.maps.DirectionsService();
    console.log(' TaskDetailPage -> this.task.status, this.task.type', this.task.status, this.task.type);
    this.checkTaskStatusUpdateView(this.task.status, this.task.type);
    console.log(' TaskDetailPage -> this.started', this.started);
    console.log(' TaskDetailPage -> this.completed', this.completed);
    console.log(' TaskDetailPage -> this.task.type !== this.runType.THREELEGS', this.task.type !== this.runType.THREELEGS);
  }

  ngOnInit() {
    // console.log(' TaskDetailPage -> ngOnInit -> this.task', this.task);
    if( this.isAvailable === undefined) this.isAvailable = this.available;
    // console.log(' TaskDetailPage -> ngOnInit -> this.available', this.available);
    console.log(' TaskDetailPage -> ngOnInit -> this.started', this.started);
    console.log(' TaskDetailPage -> ngOnInit -> this.completed', this.completed);
    // let runId = this.task.runId;
    // this.run = this.runzService.getRun(runId);  
    // this.checkTaskStatusUpdateView(this.task.status, this.task.type);
}

  ngAfterViewInit() {    
    // this.isAvailable = this.geoService.isAvailable;
    // console.log(' TaskDetailPage -> ngAfterViewInit -> this.isAvailable', this.isAvailable);    
    // console.log(' TaskDetailPage -> ngAfterViewInit -> this.completed', this.completed);
  }

  ionViewDidLoad() {
    console.log(' TaskDetailPage -> ionViewDidLoad -> ionViewDidLoad()');
    this.platform.ready().then( () => {
      // console.log(' TaskDetailPage -> ionViewDidLoad -> this.map.taskStatus', this.map.taskStatus);        
      // console.log(' TaskDetailPage -> ionViewDidLoad -> this.completed ', this.completed );
      this.updateDataAndView(this.task.status)       
      // this.updatePBValue(this.task.status);
      // console.log(' TaskDetailPage -> ionViewDidLoad -> this.updatePBValue');
      if (this.updatePositionIntervalSub !== undefined) {
        this.updatePositionIntervalSub.unsubscribe();
      }
      // this.map.resolveRoute(this.task.status, this.task.type);
      // this.map.returnDirections(this.task.status, this.map.route);
      
      this.updatePositionInterval = Observable.timer(10000, 20000);
      
      if (this.task.status === RunStatus.STARTED ||
          this.task.status === RunStatus.ON_THE_WAY_BACK ||
          this.task.status === RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION) {
          
        this.updatePositionIntervalSub = this.updatePositionInterval.subscribe( _ => {
          console.log(' TaskDetailPage -> ionViewDidLoad -> this.updatePositionInterval', this.updatePositionInterval);
          this.updateDataAndView(this.task.status);
          // this.updatePBValue(this.task.status);
        });
          // console.log(' TaskDetailPage -> this.updatePositionInterval -> updatePositionInterval', this.updatePositionInterval);
      }      
    })
  }

  ionViewWillEnter() {
    // console.log(' TaskDetailPage -> ionViewWillEnter -> this.isAvailable', this.isAvailable);  
  }

  ionViewDidEnter() {
    this.runnerPosition = this.map.runnerPosition;
    this.distanceToNext = this.distanceToNext != undefined ? this.distanceToNext : '---';
    // console.log(' TaskDetailPage -> ionViewDidEnter -> this.distanceToNext', this.distanceToNext);
    this.durationToNext = this.durationToNext != undefined ? this.durationToNext : '---';
    // this.totalDistance = ;  
  }

  ngAfterViewChecked() {
    // if ( this.task.status !== 'has completed') this.updateCTAText(this.ctaText);
  }  

  ionViewWillLeave() {
    // console.log(' TaskDetailPage -> ionViewWillLeave -> this.updatePositionInterval', this.updatePositionInterval);
  }

  ionViewDidLeave() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
    this.ngUnsubscribe.unsubscribe();
    if (this.updatePositionIntervalSub) 
      this.updatePositionIntervalSub.unsubscribe();
  }

  updatedirectionsToNext(event) {
    console.error(' TaskDetailPage -> updatedirectionsToNext -> event', event);
    this.distanceToNext = (event.distance / 1000).toFixed(1) + ' km';
    this.durationToNext = event.duration;
    this.durationToNext = this.convert.secondsToHrsMinsSec(this.durationToNext);
  }

  // From event emitter in MapComponent
  updateStartedAt(event: any) {
    // console.log(' TaskDetailPage -> updateStartedAt -> event', event);
    if (event !==  "" && event !== undefined) {
      this.startedAt = new Date(event.seconds *1000);
    }    
  }

  checkTaskStatusUpdateView(status, runType) {    
    console.log(' TaskDetailPage -> checkTaskStatusUpdateView -> status', status);
    this.ctaText = '';
    this.pbOptions.value = 0;
    switch(status) {
      case RunStatus.NOT_STARTED:
        this.started = false;
        this.pbOptions.mode = 'indeterminate';
        this.ctaText = runType !== RunType.THREELEGS ? 'START 1/2 ' : 'START 1/3 ';        
        break;
      case RunStatus.STARTED:
        this.started = true;    
        this.pbOptions.mode = 'determinate';
        this.task.status = RunStatus.STARTED;
        this.task.taskStatus = TaskStatus.OK;
        this.ctaText = runType !== RunType.THREELEGS ? 'COMPLETE 1/2 ': 'COMPLETE 1/3 ';        
        break;
      case RunStatus.ARRIVED_AT_DESTINATION:
        this.started = true;
        if (runType !== RunType.THREELEGS) {
          this.oneOfTwoCompleted = true;
          // console.log(' TaskDetailPage -> checkTaskStatusUpdateView -> this.oneOfTwoCompleted', this.oneOfTwoCompleted);
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
        // console.log(' TaskDetailPage -> checkTaskStatusUpdateView -> this.pbOptions.value', this.pbOptions.value);
        this.pbOptions.mode = 'determinate';
        this.task.status = RunStatus.COMPLETED;
        this.task.taskStatus = TaskStatus.OK;
    }
    console.log(' TaskDetailPage -> checkTaskStatusUpdateView -> this.ctaText', this.ctaText);
  }

  updateStatus(confirmValue, text?) {
    console.log(' TaskDetailPage -> updateStatus -> text', text);
    console.log(' TaskDetailPage -> updateStatus -> confirmValue', confirmValue);
    // console.log(' TaskDetailPage -> updateStatus -> this.started', this.started);

    if (confirmValue >= 80) {      
      console.log(' TaskDetailPage -> updateStatus -> confirmValue >= 80');
      setTimeout( () => {
        this.taskStatus = text;
        this.isAvailable = true;          
        console.log(' TaskDetailPage -> updateStatus -> this.isAvailable', this.isAvailable);        
        console.log(' TaskDetailPage -> updateStatus -> text !(this.runStatus.COMPLETED)', !this.runStatus.COMPLETED);
        switch(true) {
          case (text !== RunStatus.COMPLETED):
            console.log(' TaskDetailPage -> updateStatus -> case !RunStatus.COMPLETED');
            this.updateDataAndView(text);
            if( this.updatePositionIntervalSub !== undefined &&
                text === (RunStatus.ARRIVED_AT_DESTINATION ||
                          RunStatus.ARRIVED_AT_SECOND_DESTINATION)) {
              this.updatePositionIntervalSub.unsubscribe();              
            } else if (text !== (RunStatus.ARRIVED_AT_DESTINATION &&
                        RunStatus.ARRIVED_AT_SECOND_DESTINATION )) {
                          this.updatePositionIntervalSub = this.updatePositionInterval
                .subscribe( _ => {
                  console.log(' TaskDetailPage -> this.updatePositionInterval -> this.updatePositionInterval', this.updatePositionInterval);
                  this.updateDataAndView(this.taskStatus);
                });
            }    
            break;
          case (text === RunStatus.COMPLETED):
          this.updatePositionIntervalSub.unsubscribe();
            if(!this.completed) {    
              this.completed = true;
              this.completedAt = new Date(Date.now());
              this.task.updatedAt = new Date(Date.now());
              this.task.closedAt = new Date(Date.now());
              this.task.isDone = true;  
            }
            this.updateDataAndView(text);
            break;
        } 
      }, 400);
      
    } else if (confirmValue > 0 && confirmValue < 80 ) {
      setTimeout( () => {
        this.moveCursorAndActiveBarLeft();  
      },400);
    }
  }

  unSubscribeAllSubs() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
    this.ngUnsubscribe.unsubscribe();
  }

  updateDataAndView(taskStatus) {
    this.map.resolveRoute(taskStatus, this.task.type);
    if (this.map.route !== undefined) {
      this.map.returnDirections(this.map.route);
      setTimeout( () => {      
        this.map.returnAndUpdateRideData(taskStatus, this.map.directions);
        this.task.updatedAt = new Date(Date.now());
        this.checkTaskStatusUpdateView(taskStatus, this.task.type);
        this.updateTaskAndView();
        // this.updatePBValue(text);
        console.log(' TaskDetailPage -> updateDataAndView -> updateDataAndView');
      },1000);
    } else {
      console.log(' TaskDetailPage -> updateDataAndView -> this.map.route === undefined', this.map.route === undefined);
    }    
    
  }

  updateTaskAndView() {
    // console.log(' TaskDetailPage -> updateDataAndView -> this.task', this.task);
    this.tasksService.updateRunnerTask(this.task.id, this.task )
      .then( () => {        
        // console.log(' TaskDetailPage -> updateDataAndView -> response', response);
        // console.log(' TaskDetailPage -> updateDataAndView -> this.started', this.started);
        this.geoService.updatePosition(this.isAvailable)    
          .then( () => console.log(' TaskDetailPage -> updateDataAndView -> updatePosition'))
        
        if (!this.completed) {
          setTimeout( () => {                 
            this.moveCursorAndActiveBarLeft(); 
            this.updateCTAText(this.ctaText);                                
          },200);  
        }
      })
      .catch(error => console.error(error));
    
    // console.log(' TaskDetailPage -> updateDataAndView -> this.legs', this.legs);
  }

  /**
   * Triggered when value changes in Map Component
   * 
  */  
  updatePBValue(value) {
    this.pbOptions.value = value;
    // switch(taskStatus) {
    //   case RunStatus.STARTED:
    //     this.pbOptions.value = this.map.legOnePercentageDistanceTravelled;
    //     break;
    //   case RunStatus.ON_THE_WAY_BACK:
    //     this.pbOptions.value = this.map.legTwoPercentageDistanceTravelled;
    //     break;
    //   case RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION:
    //     this.pbOptions.value = this.map.legTwoPercentageDistanceTravelled;
    //     break;
    //   case RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION:
    //     this.pbOptions.value = this.map.legTwoPercentageDistanceTravelled;
    //     break;
    //   case RunStatus.COMPLETED:
    //     this.pbOptions.value = 100;
    // }
  }

  updateCTAText(text) {
                                       // nativeElement.children[""0""].children[""0""].children[""0""].children[""0""].children[""0""].children[""0""]
    this.ctaTextElement = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"];
    // console.log(' TaskDetailPage -> updateCTAText -> this.ctaTextElement', this.ctaTextElement);
    // console.log(' TaskDetailPage -> updateCTAText -> this.ctaElement.nativeElement', this.ctaElement.nativeElement);
    this.ctaTextElement.textContent = text;
  }

  moveCursorAndActiveBarLeft() {
    this.activeBar =  this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[1];
    this.cursor =     this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[2];
    this.cursorMoveLeft = true;
    this.cursor.style.left = '0%';
    this.activeBar.style.right = '100%';
    // console.log(' TaskDetailPage -> moveCursorAndActiveBarLeft -> this.cursor', this.cursor);
    // console.log(' TaskDetailPage -> moveCursorAndActiveBarLeft -> this.cursor.style.left', this.cursor.style.left);
    // console.log(' TaskDetailPage -> moveCursorAndActiveBarLeft -> this.activeBar.style.right', this.activeBar.style.right);
  }
  
}
