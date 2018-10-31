import { Injectable } from '@angular/core';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Observable } from 'rxjs/Observable';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Place } from '../_models/place';
import { BehaviorSubject, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
// import { HTTP } from '@ionic-native/http';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { RunnerTracking } from '../_models/runner-tracking';

declare var google;

@Injectable()
export class GeoService {

    ggmapsAPIKey = environment.googleMapsKey;

    runnerTrackingDocument: AngularFirestoreDocument<RunnerTracking>;
    runnerTracking: Observable<RunnerTracking>;
    // runnersTrackingCollection: AngularFirestoreCollection<RunnerTracking>;

    posOptions = {timeout: 7000, enableHighAccuracy: true};
    watch: Observable<Position>;
    watchSubscription: Subscription;
    watchOptions = {timeout : 7000, enableHighAccuracy: true};
    runnerPosition;
    runnerPositionSubj = new BehaviorSubject<Geoposition>(this.runnerPosition);
    runnerPosObs = this.runnerPositionSubj.asObservable();

    isAvailable: boolean;

    locations;
    locationsCollection;

    directionsService = new google.maps.DirectionsService();

    constructor(
        private geolocation: Geolocation,
        private afs: AngularFirestore,
        private http: HttpClient) {

        this.getPosition();
        this.watchPosition();
        this.locationsCollection = this.afs.collection<Place>('locations');
        // this.runnersTrackingCollection = this.afs.collection<RunnerTracking>('runners', ref => ref.where('runner.uid', '==', 6));      
        // this.runnersTrackingCollection = this.afs.collection<RunnerTracking>('runners'); 
        
        //TODO: Change reference id for dynamic one   
        this.runnerTrackingDocument = this.afs.collection<RunnerTracking>('runners')
            .doc<RunnerTracking>('uLUY8PTcxbYkCGi77GG8');
        
            // this.runnerTrackingDocument = this.runnersTrackingCollection.doc (ref => ref.where('runner.uid', '==', 6));
        this.runnerTracking = this.runnerTrackingDocument.valueChanges();
    }
    
    getPosition() {
        this.geolocation.getCurrentPosition(this.posOptions)
            .then((resp) => {
                console.log(' GeoService -> getPosition -> resp', resp);
                this.runnerPosition = resp;
                this.runnerPositionSubj.next(this.runnerPosition);
            })
            .catch((error) => {
                console.log('Error getting location', error);
            });
    }

    watchPosition() {
        this.watch = this.geolocation.watchPosition(this.watchOptions);
        this.watchSubscription = this.watch
        .pipe(filter( (p) => p.coords !== undefined))
        .subscribe((position) => {
            console.log(' GeoService -> watchPosition -> position', position);
            this.runnerPosition = position;
            this.runnerPositionSubj.next(this.runnerPosition);
            console.log(' GeoService -> watchPosition -> this.runnerPosition', this.runnerPosition);
            },
            (error) => console.log(' GeoService -> watchPosition -> error', error)
        );
    }

    
    updatePosition(available) {
        let positionUpdated;
        if (!available) this.watchSubscription.unsubscribe();
        if (this.runnerPosition !== undefined) {
            let position = {
                coords: {
                    latitude: this.runnerPosition.coords.latitude,
                    longitude: this.runnerPosition.coords.longitude
                },
                timestamp: this.runnerPosition.timestamp
            }
            positionUpdated = {
                available,
                position,
            }
        } else {
            positionUpdated = {
                available              
            }
        }
        
        return this.runnerTrackingDocument.update(positionUpdated)
            .then( () => {
                this.isAvailable = available;
            })
            .catch( error => console.log(error));
    }

    getStatus(): Observable<RunnerTracking> {        
        console.log(' GeoService -> this.runnerTracking', this.runnerTracking);
        return this.runnerTracking;
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
    
    getDirection() {
        // const headers = ;
        return this.http.get(
            'https://maps.googleapis.com/maps/api/directions/json?origin=Disneyland&destination=Universal+Studios+Hollywood&key=' + this.ggmapsAPIKey,
            {})
            // .then(data => {
            //     console.log('getDirection() data.status: ', data.status);
            //     console.log('getDirection() data.data: ', data.data); // data received by server
            //     console.log('getDirection() data.headers: ', data.headers);            
            //   }).catch(error => {

            //     console.log(error.status);
            //     console.log(error.error); // error message as string
            //     console.log(error.headers);
            
            //   });
    }

    updateDirections(destination) {
        this.directionsService.route(
            {
                origin: new google.maps.LatLng(this.runnerPosition.coords.latitude, this.runnerPosition.coords.longitude),
                destination: new google.maps.LatLng(destination.latitude, destination.longitude),            
                travelMode: 'DRIVING'
            },
            (response, status) => {
                if (status === 'OK') {
                    console.log("response from this.directionsService.route: ", response);
                    return response;                    
                } else {
                    window.alert('Directions request failed due to ' + status);
                }
            }
        );        
    }

    calculateRouteLeft(destination) {
        const route = this.updateDirections(destination);

    }

}
