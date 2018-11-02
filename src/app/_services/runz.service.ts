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
    runDocument;
    // runDocument: AngularFirestoreDocument<any>;

    constructor(private afs: AngularFirestore) { 
        // TODO: replace with dynamic ref
        this.runzCollection = this.afs.collection('runz');
            
        // , ref => ref.where('taskId', '==', '55mVebuSu7sYymSbOE2u')
    }

    // TODO: change the method with task.status. from and to are not the same of drop off or pick up
    runInit(legs, task) {
        if (legs === 2) {
            let run = {
                taskId: task.id,
                percent_dist_travelled: 0,
                distance_total: 0,
                duration_total: 0,
                legs: {
                    one: {
                        from: task.type === 'drop off' ? task.from : task.to,
                        to: task.type === 'drop off' ? task.to : task.from,
                        started_at: null,
                        completed_at: null,
                        percent_dist_travelled: 0,
                        distance: 0,
                        duration: 0
                    },
                    two: {
                        from: task.type === 'drop off' ? task.to : task.from,
                        to: task.type === 'drop off' ? task.from : task.to,
                        started_at: null,
                        completed_at: null,
                        percent_dist_travelled: 0,
                        distance: 0,
                        duration: 0
                    }
                }
            }
            return this.runzCollection.add(run)
                .then( response => console.log(response));
        } else if (legs === 3) {
            let run = {
                taskId: task.id,
                percent_dist_travelled: 0,
                distance_total: 0,
                duration_total: 0,
                legs: {
                    one: {
                        from: task.from,
                        to: task.to,
                        started_at: null,
                        completed_at: null,
                        percent_dist_travelled: 0,
                        distance: 0,
                        duration: 0
                    },
                    two: {
                        from: task.to,
                        to: task.from,
                        started_at: null,
                        completed_at: null,
                        percent_dist_travelled: 0,
                        distance: 0,
                        duration: 0
                    },
                    three: {
                        from: task.to,
                        to: task.from,
                        started_at: null,
                        completed_at: null,
                        percent_dist_travelled: 0,
                        distance: 0,
                        duration: 0
                    }

                }
            }
            return this.runzCollection.add(run)
                .then( response => console.log(response));
        }
        
    }

    getRun(id) {
        // return this.runDocument = this.runzCollection.doc(id);
        // console.log(' RunzService -> getRun -> this.runDocument', this.runDocument);
        //  this.runDocument.valueChanges();
        
        return this.runzCollection.doc(id).ref.get();
    }

    // getRun() {
    //     return this.runDocument.ref.get()
    //         .then(doc => {
    //         if (!doc.exists) {
    //             console.log(' RunzService -> getRun -> No such document!');
    //         } else {
    //             console.log(' RunzService -> getRun -> doc.data()', doc.data());
    //             return doc.data();
    //         }
    //         })
    //         .catch(err => {
    //             console.log(' RunzService -> getRun -> Error getting document', err);
    //         });;
    // }

    updateRun(id, runDirections) {
        // TODO: implement dynamic query for doc id 
        this.runDocument = this.runzCollection.doc(id);      
        return this.runDocument.update(runDirections);

        // this.runzCollection.doc('0wopfJYxQ19ofqFqEIrH').ref.get().then((doc) => {
        //     if (doc.exists) {
        //         console.log("Document data:", doc.data());
        //         return doc;
        //     } else {
        //         console.log("No such document!");
        //     }
        //   }).catch(function(error) {
        //       console.log("Error getting document:", error);
        //   });
    }
}
