import { Component, OnInit } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AuthService } from '../../app/_services/auth.service';
import { TasksService } from '../../app/_services/tasks.service';
import { Runner } from '../../app/_models/runner';
import { RunnerTask } from '../../app/_models/runner-task';
import { TaskDetailPage } from '../task-detail/task-detail';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {
  available: boolean;
  runner: Runner;
  tasks: RunnerTask[] = [];
  params: any;

  constructor(
    public navCtrl: NavController,
    public authService: AuthService,
    private tasksService: TasksService) {

    
  }

  ngOnInit() {
    this.available = false;
    // this.runner = this.authService.currentUser;
    this.tasksService.getRunnerTasks();
    this.runner = JSON.parse(localStorage.getItem('user')); 
    console.log('this runner: ', this.runner);
    this.tasksService.getRunnerTasks()
      .subscribe( tsks => {     
        if (tsks && tsks.length > 0) {
          tsks.forEach(tsk => tsk.startAt = new Date(tsk.startAt.seconds * 1000));
          console.log('runner tasks: ', tsks);
          this.tasks = tsks; 
        }  
      });      
  }

  buttonClick(task) {
    this.navCtrl.push(TaskDetailPage, task);
  }

  goBack() {
    console.log("popping");
    this.navCtrl.pop();
  }

}
