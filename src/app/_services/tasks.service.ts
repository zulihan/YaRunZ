import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { Observable } from 'rxjs/Observable';
// import { map } from 'rxjs/operators';
import 'rxjs/add/operator/map';
import { Task } from '../_models/task';
import { Subject } from 'rxjs/Subject';
import { RunnerTask } from '../_models/runner-task';
import { Runner } from '../_models/runner';
import { AuthService } from './auth.service';



@Injectable()
export class TasksService {

    id: number;

    tasksCollection: AngularFirestoreCollection<Task> ;
    taskDocument: AngularFirestoreDocument<Task>;

    runnersTasksCollection: AngularFirestoreCollection<RunnerTask>;
    runnersTasks: Observable<RunnerTask[]>;
    runnerTask: AngularFirestoreDocument<RunnerTask>;
    editedRunnerTask =  new Subject<RunnerTask>();
    runnerTasks: Observable<RunnerTask[]>;
    runner: Runner;

    tasks: Observable<Task[]>;
    editedTask = new Subject<Task>();
    lastUpdateSubject = new Subject<any>();
    lastUpdate;

    taskToEdit: Task;

    constructor(private afs: AngularFirestore, private authService: AuthService) {
        // this.id = +this.authService.currentUser.id;

        // this.runner = JSON.parse(localStorage.getItem('user'));
        // console.log(this.runner.id);
        this.runnersTasksCollection = this.afs.collection('runnersTasks', ref => ref.where('runner.id', '==', 6));
        // this.runnersTasksCollection = this.afs.collection('runnersTasks', ref => ref.where('runner.id', '==', this.runner.id));
        console.log(this.runnersTasksCollection);
    }

    getRunnerTasks(): Observable<RunnerTask[]> {
        this.runnerTasks = this.runnersTasksCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
              const data = a.payload.doc.data() as RunnerTask;
              data.id = a.payload.doc.id;
              return data;
            });
          });
          console.log('this runner tasks: ', this.runnerTasks)
          return this.runnerTasks;
    }    


    updateRunnerTask(taskId: string, task: RunnerTask) {
        this.runnerTask = this.runnersTasksCollection.doc<RunnerTask>(taskId);
        this.runnerTask.update(task);
        // this.editedRunnerTask.next(this.taskToEditReset());
    }


    getTasks() {
        this.tasks = this.tasksCollection.snapshotChanges().map(actions => {
            return actions.map(a => {
              const data = a.payload.doc.data() as Task;
              data.id = a.payload.doc.id;
              return data;
            });
          });
          return this.tasks;
    }    

    editTask(task: any) {
        this.taskToEdit = task;
        this.editedTask.next(this.taskToEdit);
    }

    taskToEditReset() {
        return this.taskToEdit = {
            id: '',
            closedAt: 0,
            createdAt: 0,
            createdBy: '',
            isDone: false,
            todo: '',
            updatedAt: 0
          };
    }

    getEditedTask() {
        console.log('edited task', this.editedTask);
    }

    updateCheckedOrUnchecked(taskId: string, isDone: boolean) {
        this.taskDocument = this.tasksCollection.doc<Task>(taskId);
        if (isDone) {
            this.taskDocument.update({ isDone, closedAt: Date.now() });
        } else {
            this.taskDocument.update({ isDone, closedAt: 0 });
        }
        this.lastUpdate = Date.now();
        this.lastUpdateSubject.next(this.lastUpdate);
    }

    updateTask(taskId: string, task: Task) {
        this.taskDocument = this.tasksCollection.doc<Task>(taskId);
        this.taskDocument.update(task);
        this.editedTask.next(this.taskToEditReset());
    }

    

    sendLastUpdate() {
        this.lastUpdate = Date.now();
        this.lastUpdateSubject.next(this.lastUpdate);
    }

}
