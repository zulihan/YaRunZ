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
         // console.log(' TasksService -> constructor -> this.runner.id', this.runner.id);
        this.runnersTasksCollection = this.afs.collection('runnersTasks', ref => ref.where('runner.id', '==', 6).orderBy('startAt'));
        this.runnerTasks = this.runnersTasksCollection.valueChanges();
        console.log(' TasksService -> constructor -> this.runnerTasks', this.runnerTasks);
        // this.runnersTasksCollection = this.afs.collection('runnersTasks', ref => ref.where('runner.id', '==', this.runner.id));
        console.log(' TasksService -> constructor -> this.runnersTasksCollection', this.runnersTasksCollection);
    }

    getRunnerTasks(): Observable<RunnerTask[]> {
        return this.runnersTasksCollection.snapshotChanges().map(actions => {
            return actions.map(action => {
              const data = action.payload.doc.data() as RunnerTask;
              const payloadType = action.payload.type;
              console.log(' TasksService -> getRunnerTasks() -> payloadType', payloadType);
              const id = action.payload.doc.id;
              return {id,payloadType,...data};
            });
          });
        // return this .runnersTasksCollection.valueChanges();
          
          
    }    


    updateRunnerTask(taskId: string, task: RunnerTask) {
        console.log(' TasksService -> updateRunnerTask -> task', task);
        this.runnerTask = this.runnersTasksCollection.doc<RunnerTask>(taskId);
        return this.runnerTask.update(task);
        // this.editedRunnerTask.next(this.taskToEditReset());
    }
    

}
