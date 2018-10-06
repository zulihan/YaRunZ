import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AuthService } from './auth.service';
import { RunnerTracking } from '../_models/runner-tracking';
import { GeoService } from './geo.service';


@Injectable()
export class RunnerService {

    runnersCollection: AngularFirestoreCollection<RunnerTracking>;
    runnerDocument: AngularFirestoreDocument<RunnerTracking>;

    constructor(
        private afs: AngularFirestore,
        private authService: AuthService,
        private geoService: GeoService) { 
        // this.runnersCollection = this.afs.collection('runnersTasks', ref => ref.where('runner.id', '==', this.runner.id));
        this.runnersCollection = this.afs.collection('runners', ref => ref.where('runner.uid', '==', 6));
        this.runnerDocument = this.runnersCollection.doc<RunnerTracking>("uLUY8PTcxbYkCGi77GG8");
        console.log('this.runnerDocument: ', this.runnerDocument);
    }

    updateRunnerPosition(isAvailable) {
        let runnerTracking = {};
        if (isAvailable) {
            let position = this.geoService.runnerPosition;
            // for (let key in position) {                
            //         console.log(position[key])
            //         position[key] = position[key] === null ? 0 : position[key];
                
            // } 
            let runnerPosition = {
                coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                },
                timestamp: position.timestamp
            }           
            console.log('runner position: ', position)
            runnerTracking = {
                available: true,
                position: runnerPosition,
                uid: 6,
                userName: "Elvira"
            }

        } else {
            runnerTracking = {
                available: false,
                position: {},
                uid: 6,
                userName: "Elvira"
            }
        }
        this.runnerDocument.update(runnerTracking);
    }
    
}
