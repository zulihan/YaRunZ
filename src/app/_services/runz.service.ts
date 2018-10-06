import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';

import { Observable } from 'rxjs/Observable';
import { Task } from '../_models/task';
import { Subject } from 'rxjs/Subject';
import { RunnerTask } from '../_models/runner-task';
import { Runner } from '../_models/runner';

@Injectable()
export class RunzService {

runzCollection: AngularFirestoreCollection<any>; 
RunDocument: AngularFirestoreDocument<any>;

constructor(private afs: AngularFirestore) { 
    this.runzCollection = this.afs.collection('runz');
}

    runInit(legs, task) {
        if (legs === 2) {
            let run = {
                taskId: task.id,
                legs: {
                    one: {
                        from: task.from,
                        to: task.to,
                        started_at: new Date(Date.now()),
                        completed_at: null
                    },
                    two: {
                        from: task.to,
                        to: task.from,
                        started_at: null,
                        completed_at: null
                    }
                }
            }
            return this.runzCollection.add(run)
                .then( response => console.log(response));
        }
        
    }

    // runUpdate(legs, task) {
    //     let run = {
    //         taskId: task.id,
    //         legs: {
    //             one: {
    //                 from: task.from,
    //                 to: task.to,
    //                 started_at: new Date(Date.now()),
    //                 completed_at: null
    //             },
    //             two: {
    //                 from: task.to,
    //                 to: task.from,
    //                 started_at: null,
    //                 completed_at: null
    //             }
    //         }     
    //     }
    //     return this.runzCollection.update(run);
    // }
}
