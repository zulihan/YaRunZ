import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { Place } from '../_models/place';
import { BehaviorSubject } from 'rxjs';


@Injectable()
export class GeoService {

    posOptions = {timeout: 10000, enableHighAccuracy: false};
    watchOptions = {timeout : 3000, enableHighAccuracy: false};
    runnerPosition;
    runnerPositionSubj = new BehaviorSubject<Geoposition>(this.runnerPosition);
    runnerPosObs = this.runnerPositionSubj.asObservable();

    locations;
    locationsCollection

    constructor(private geolocation: Geolocation, private afs: AngularFirestore) {
        //this.getPosition();
        this.watchPosition();
        this.locationsCollection = this.afs.collection<Place>('locations');        
    }

    getPosition() {
        this.geolocation.getCurrentPosition(this.posOptions).then((resp) => {
            console.log('response from getCurrentPosition: ', resp)
            this.runnerPosition = resp;
            return this.runnerPosition;
            }).catch((error) => {
                console.log('Error getting location', error);
            });
    }

    watchPosition() {
        let watch = this.geolocation.watchPosition(this.watchOptions);
        watch
            // .filter( (p) => p.coord !== undefined)
            .subscribe((position) => {
            console.log('response from watchPosition', position);
            this.runnerPosition = position;
            this.runnerPositionSubj.next(this.runnerPosition);
            console.log('this.runnerPosition', this.runnerPosition);
            // data can be a set of coordinates, or an error (if an error occurred).
            // data.coords.latitude
            // data.coords.longitude

        }, (error) => console.log(error));
        
    }

    getLocations(): Observable<Location[]> {
        // this.locations.subscribe(loc => console.log('this.locations from getLocations():', loc));
        this.locations = this.locationsCollection.snapshotChanges().map(actions => {
          return actions.map(a => {
            const data = a.payload.doc.data() as Place;
            const id = +a.payload.doc.id;
            return { id, ...data };
          });
        });
        return this.locations;
       }
 

}
