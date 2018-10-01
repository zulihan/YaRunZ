import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../app/_services/auth.service';
import { TasksService } from '../../app/_services/tasks.service';
import { Runner } from '../../app/_models/runner';
import { RunnerTask } from '../../app/_models/runner-task';
import { ElementDef } from '@angular/core/src/view';
import {style, state, animate, transition, trigger} from '@angular/animations';
    

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
    )
  ],
})
export class TaskDetailPage implements OnInit, AfterViewInit {

  @ViewChild('ctaList') ctaElement: ElementRef;
  // available: boolean;
  runner: Runner;
  task: any;
  
  rangeBar;
  // rangeBarActive = this.rangeBarActiveElts;
  rangeKnobHandle;
  ctaText;
  ctaTextCompleted;
  

  legs;  
  startConfirmValue;
  started;

  OneOfTwoCompletedConfirmValue;
  oneOfTwoCompleted;

  twoOfTwoStartedConfirmValue;
  twoOfTwoStarted;

  twoOfTwoCompletedConfirmValue;
  twoOfTwoCompleted

  confirmed = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public authService: AuthService,
    private tasksService: TasksService) {
    this.task = navParams.data;    
  }

  ngOnInit() {
    console.log('this params: ', this.task);     
    this.rangeBar = document.querySelector('ion-range div div:nth-child(1)');  
    this.rangeKnobHandle = document.querySelector('div.range-knob-handle'); 
        
  }
  
  ngAfterViewInit() {
     
    // this.ctaText = this.ctaElement.nativeElement.children["0"].children["0"];
    // this.ctaText.textContent = 'start'; 
    // console.log('this ctaText', this.ctaText);
    console.log('this.ctaElement: ', this.ctaElement);
    // this.ctaTextCompleted = this.ctaElement.nativeElement
    //                             .children["0"]
    //                             .children["0"]
    //                             .children["0"]
    //                             .children["0"]
    //                             .children["0"]
    //                             .children["0"].children["0"]
    //                             ;
    // if (this.started) this.ctaText.textContent = '1 of 2 completed'; 
    // console.log('rangeBar', this.rangeBar);
  }

  // get confirmVal() {
  //   return true;
  // }

  updateOneOfTwoStartedConfirmValue(confirmValue) {
    console.log(confirmValue);
    // if (confirmValue !== 0 || 100) {
    //   setTimeout( () => )
    // }
    if (confirmValue === 100) {
      setTimeout( () => {
        // this.rangeBarActive.style.right = '100%';
        // this.rangeKnobHandle.style.left = '0%';
        return this.started = true;      
      }, 800)
      
      setTimeout( () => console.log('this.started: ', this.started), 1200 );
    } 
    
    // console.log('this.rangeBarActive', this.rangeBarActive);
   }

   updateOneOfTwoCompletedConfirmValue(confirmValue) {
    if (confirmValue === 100) {
      setTimeout( () => {
        return this.oneOfTwoCompleted = true;      
      }, 800)
      
    } 
   }

   updateTwoOfTwoStartedConfirmValue(confirmValue) {
    if (confirmValue === 100) {
      setTimeout( () => {
        return this.twoOfTwoStarted = true;      
      }, 800)
   }

  }

  updateTwoOfTwoCompletedConfirmValue(confirmValue) {
    if (confirmValue === 100) {
      setTimeout( () => {
        this.twoOfTwoCompleted = true;        
      }, 800)
      setTimeout( () => this.navCtrl.pop(), 2000)
    }
  }

}
