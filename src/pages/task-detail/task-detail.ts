import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, DoCheck, AfterViewChecked } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../app/_services/auth.service';
import { TasksService } from '../../app/_services/tasks.service';
import { Runner } from '../../app/_models/runner';
import { RunnerTask } from '../../app/_models/runner-task';
import { ElementDef } from '@angular/core/src/view';
import {style, state, animate, transition, trigger} from '@angular/animations';
import { RunzService } from '../../app/_services/runz.service';
    

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
    // trigger(
    //   'cursorMoveLeft', [
    //     transition(':leave', [
    //       style({transform: 'translateY(*)', opacity: 0.8}),
    //       animate('500ms', style({transform: 'translateY(-100%)', opacity: 1}))
    //     ])
    //   ]
    // )
  ],
})
export class TaskDetailPage implements OnInit, AfterViewInit, AfterViewChecked {

  @ViewChild('ctaList') ctaElement: ElementRef;
  // available: boolean;
  runner: Runner;
  task: any;
  taskLocations = [];

  cursorMoveLeft = false;
  
  rangeBar;
  activeBar;
  // rangeBarActive = this.rangeBarActiveElts;
  rangeKnobHandle;
  ctaText;
  ctaTextCompleted;
  
  cursor;

  legs = 2;  
  startConfirmValue;
  started = false;

  OneOfTwoCompletedConfirmValue;
  oneOfTwoCompleted = false;

  twoOfTwoStartedConfirmValue;
  twoOfTwoStarted = false;

  twoOfTwoCompletedConfirmValue;
  twoOfTwoCompleted = false;

  confirmed = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public authService: AuthService,
    private tasksService: TasksService,
    private runzService: RunzService) {

    this.task = navParams.data;  
    this.taskLocations.push(this.task.from);    
    this.taskLocations.push(this.task.to);
  }

  ngOnInit() {
    console.log('this params: ', this.task);
    switch(this.task.status) {
      case 'has not started yet':
        this.started = false;
        break;
      case 'has started':
        this.started = true;
        break;
      case 'has arrived at destination':
        this.started = true;
        this.oneOfTwoCompleted = true;
        break;
      case 'is on the way back':
        this.started = true;
        this.oneOfTwoCompleted = true;
        this.twoOfTwoStarted = true;
        break;
      case 'has completed':
        this.started = true;
        this.oneOfTwoCompleted = true;
        this.twoOfTwoStarted = true;
        this.twoOfTwoCompleted = true;
    }        
    // this.rangeBar = document.querySelector('ion-range div div:nth-child(1)');  
    // this.rangeKnobHandle = document.querySelector('div.range-knob-handle'); 
    // console.log('this.ctaElement :', this.ctaElement);    
  }

  ngAfterViewChecked() {
    // this.ctaText = this.ctaElement._elementRef.nativeElement.children["0"].children["0"];
    // console.log('this.ctaElement', this.ctaElement);

  }
  
  ngAfterViewInit() {
    console.log('this.ctaElement: ', this.ctaElement);
    console.log('after view Init');
    this.cursor = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[2];
    this.activeBar = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children[1];
    this.ctaText = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"];
    
    switch(this.task.status) {
      case 'has not started yet':
        this.ctaText.textContent = 'START';      
        console.log('this cursor: ', this.cursor);
        break;
      case 'has started':
        this.ctaText.textContent = 'COMPLETE 1/2 ';
        break;
      case 'has arrived at destination':
        this.ctaText.textContent = 'START 2/2 ';
        break;
      case 'is on the way back':
        this.ctaText.textContent = 'COMPLETE 2/2 ';
        break;      
    }       
    
    
    // console.log('this.ctaElement: ', this.ctaElement._elementRef.nativeElement.children["0"].children["0"]);
    // this.ctaTextCompleted = this.ctaElement.nativeElement
    //                             .children["0"]
    //                             .children["0"]
    //                             .children["0"]
    //                             .children["0"]
    //                             .children["0"]
    //                             .children["0"].children["0"]
    //                             ;
    //if (this.started) this.ctaText.textContent = 'COMPLETE 1 OF 2'; 
    // console.log('rangeBar', this.rangeBar);
  }

  // get confirmVal() {
  //   return true;
  // }

  updateOneOfTwoStartedConfirmValue(confirmValue) {
     
    console.log(confirmValue);
    
    if (confirmValue >= 80) {
        this.task.status = 'has started';
        this.task.taskStatus = 'ok';
        this.task.updatedAt = new Date(Date.now()).getTime();
      setTimeout( () => {        
        this.tasksService.updateRunnerTask(this.task.id, this.task );
        console.log('this legs :', this.legs);
        this.runzService.runInit(this.legs, this.task)
          .then( response => console.log(response));
        this.started = true;

        setTimeout( () => {
          console.log('this.ctaElement from updateOneOfTwoStartedConfirmValue :', this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"]);
          this.ctaText = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"];
          this.ctaText.textContent = 'COMPLETE 1/2 ';
        },200)
      }, 800)
      
      setTimeout( () => console.log('this.started: ', this.started), 1200 );
    } 

    setTimeout( () => {
      if (confirmValue > 0 && confirmValue < 80 ) {
        this.cursorMoveLeft = true;
        this.cursor.style.left = '0%';
        this.activeBar.style.right = '100%';
        console.log('this.activeBar.style.right: ', this.activeBar.style.right);
      }
    },
    400)      
    
  }

   updateOneOfTwoCompletedConfirmValue(confirmValue) {
    if (confirmValue >= 80) {
      this.task.status = 'has arrived at destination';
      this.task.updatedAt = new Date(Date.now()).getTime();
      this.tasksService.updateRunnerTask(this.task.id, this.task );

      setTimeout( () => {
        this.oneOfTwoCompleted = true;
        console.log('this.ctaElement :', this.ctaElement); 
        setTimeout( () => {
          console.log('this.ctaElement from updateOneOfTwoStartedConfirmValue :', this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"]);
          this.ctaText = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"];
          this.ctaText.textContent = 'START 2/2 ';
        },200)     
      }, 800)     
      
    } 
   }
  
   updateTwoOfTwoStartedConfirmValue(confirmValue) {
    if (confirmValue >= 80) {
      this.task.status = 'is on the way back';
      this.task.updatedAt = new Date(Date.now()).getTime();
      this.tasksService.updateRunnerTask(this.task.id, this.task );

      setTimeout( () => {     
        this.twoOfTwoStarted = true;
        setTimeout( () => {
          console.log('this.ctaElement from updateOneOfTwoStartedConfirmValue :', this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"]);
          this.ctaText = this.ctaElement.nativeElement.children["0"].children["0"].children["0"].children["0"].children["0"].children["0"];
          this.ctaText.textContent = 'COMPLETE 2/2 ';
        },200)                
      }, 800)
   }

  }
  // completed
  updateTwoOfTwoCompletedConfirmValue(confirmValue) {
    console.log('this.ctaElement :', this.ctaElement); 
    if (confirmValue >= 80) {
      this.task.status = 'has completed';
      this.task.isDone = true;
      this.task.updatedAt = new Date(Date.now()).getTime();
      this.task.closedAt = new Date(Date.now());
      this.tasksService.updateRunnerTask(this.task.id, this.task );

      setTimeout( () => {
        this.twoOfTwoCompleted = true;                 
      }, 800);
      setTimeout( () => this.navCtrl.pop(), 3000)
    }
  }
}
