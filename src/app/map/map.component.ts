import { 
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  trigger,
  transition,
  style,
  animate, 
  state,
  Input,
  EventEmitter,
  Output,
  OnDestroy
} from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, LoadingController } from 'ionic-angular';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';

import { TaskStatus, RunStatus, RunType } from "../../app/_enums/enums";
import { environment as env } from '../../environments/environment';

import {
  GoogleMaps,
  GoogleMap,
  GoogleMapsEvent,
  GoogleMapOptions,
  CameraPosition,
  MarkerOptions,
  GoogleMapsAnimation,
  Marker,
  Environment,
  MarkerCluster,
  LatLng,
  GoogleMapsMapTypeId,
  Polyline,
  PolylineOptions
} from '@ionic-native/google-maps';
import { GeoService } from '../../app/_services/geo.service';
import { Observable } from 'rxjs/Observable';
import { RunzService } from '../_services/runz.service';
import { Firebase } from '@ionic-native/firebase';
import * as firebase from 'firebase';
import { timestamp } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';
import { Subscription } from 'rxjs';

// import { google } from 'google.maps';
declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html'
})

export class MapComponent implements OnInit, OnDestroy {
  
  // TODO: use enums

  @ViewChild('map_canvas') map_canvas: ElementRef;

  // @Input('mapModal') mapModal;

  // @Input('taskLocations') tlocations; 

  @Input('mapConfig') mapConfig;

  @Input('taskLocations') taskLocations; 

  @Input('taskStatus') taskStatus; 

  @Input('taskType') runType; 
  
  @Input('startAt') runStartAt;

  @Input('runId') runId;

  @Output() directionsChange = new EventEmitter();
  
  @Output() startedAtUpdate = new EventEmitter();

  @Output() legPercentageDistanceTravelled = new EventEmitter();

  ngUnsubscribe = new Subject();

  startedAt;
  startedAtTS;

  // @Output() onMapClicked = new EventEmitter<any>();
  FESTIVAL = env.FESTIVAL;
  festival = {
    name: this.FESTIVAL.NAME,
    coord: {
      latitude: this.FESTIVAL.LAT,
      longitude: this.FESTIVAL.LNG
    },
    place_id: this.FESTIVAL.PLACE_ID
  }
  run;
  runSubscription;
  
  locations = [];

  runnerPosition: Observable<Geoposition>;
  runnerPositionSubscription: Subscription;
  runnerLocationLat;
  runnerLocationLng;
  runnerMapPosition;
  
  location = new google.maps.LatLng(this.FESTIVAL.LAT, this.FESTIVAL.LNG);
  threeLocations;
  map;
  markers = [];
  runnerMarker;

  mapOptions =  {
    mapTypeId: google.maps.MapTypeId.ROADMAP, 
    zoom: 13,
    center: this.location, 
    disableDefaultUI: true,  
    fullscreenControl: true,
    styles : [
      {
        'featureType': 'all',
        'elementType': 'all',
        'stylers': [
            {
                'saturation': -100
            },
            {
                'gamma': 0.5
            }
        ]
      },
      {
        'featureType': 'water',
        'elementType': 'all',
        'stylers': [
            {
                'color': '#7dcdcd'
            }
        ]
      }
    ]
  };

  loading;
  // loading = this.loadingCtrl.create({
  //   content: 'Locating...'
  // });
     
  ggmKey = env.googleMapsKey;
  ggmKeyDebug = env.googleMapsKey;

  rendererOptions; 

  hasStarted = false; 

  directionsService;
  directionsDisplay;          
            
  initialDirections;
  directions;
  route; 
  rideData;
  distance;
  legOneDistance;
  legTwoDistance;
  legThreeDistance;
  duration;
  legOneDuration;
  legTwoDuration;
  legThreeDuration;
  distance_total;
  duration_total;
  legs;
  leg;
  distanceTravelled;
  percentageOfTotalDistTravelled;
  legOnePercentageDistanceTravelled;
  legTwoPercentageDistanceTravelled;
  legThreePercentageDistanceTravelled;
  legDistance;
  legDuration;
  legTwo;
  legThree;
  start;
  end;
  distanceToNext;
  durationToNext;

  constructor(     
      public navCtrl: NavController,
      public navParams: NavParams,
      private geolocation: Geolocation,
      private geoService: GeoService,
      private platform: Platform,
      public loadingCtrl: LoadingController, 
      private runzService: RunzService) {
        this.directionsService = new google.maps.DirectionsService();
        this.directionsDisplay = new google.maps.DirectionsRenderer();         
  }

  ngOnInit() {
    this.platform.ready().then( () => {
      this.loadMap();
      this.loadPosition();
      if (this.mapConfig === 'detail-page') {
        this.getRun();        
        // setTimeout( () => {
        //   this.resolveRoute(this.taskStatus, this.runType);
        //   this.returnDirections(this.taskStatus, this.route);
        //   setTimeout( () => {
        //     this.displayRoute(this.directions);
        //     this.returnAndUpdateRideData(this.taskStatus, this.directions);
        //   }, 1000);          
        // }, 1000);
        if(this.run === undefined) {
          if(this.taskStatus === (
                                  RunStatus.STARTED ||
                                  RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION ||
                                  RunStatus.ON_THE_WAY_BACK )) {
            this.hasStarted = true;
          }
        }    
      }        
    })
  }

  ngOnDestroy(): void {
    this.unSubscribeAllSubs();
  }  

  ionViewDidLoad() {  
    console.log(' ionViewDidLoad -> ionViewDidLoad');   
  }

  ionViewDidLeave() {
    console.log(' ionViewDidLeave -> ionViewDidLeave');    
  }

  unSubscribeAllSubs() {
    this.ngUnsubscribe.next(true);
    this.ngUnsubscribe.complete();
    this.ngUnsubscribe.unsubscribe();
  }

  getRun() {
    return this.runzService.getRun(this.runId)
      .then( run => {
        if (run.exists) {      
          this.run = run.data() as any;
        }
        if (this.run.started_at !== undefined) {
          this.startedAt = this.run.started_at;
          this.startedAtUpdate.emit(this.startedAt);
        }
        if(this.run.status === (
          RunStatus.STARTED ||
          RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION ||
          RunStatus.ON_THE_WAY_BACK )) {
            this.hasStarted = true;
        }
        if (this.run.legs.three !== undefined) {
          this.legThreeDistance = this.run.legs.three.distance;
          this.legThreeDuration = this.run.legs.three.duration;
        }
        this.legOneDistance = this.run.legs.one.distance;
        this.legOneDuration = this.run.legs.one.duration;
        this.legTwoDistance = this.run.legs.two.distance;
        this.legTwoDuration = this.run.legs.two.duration;
        this.distance_total = this.run.distance_total;
        this.duration_total = this.run.duration_total;
        this.distanceTravelled = this.run.distance_travelled;      
    })
    .catch(error => alert("Couldn't get the run from DB"));
  }

  doRefresh(refresher) {
    // console.log(' MapComponent -> doRefresh -> refresher', refresher);
    // console.log(' MapComponent -> doRefresh -> this.markers', this.markers);
    if (refresher !== 0) {
      this.removeMarkersFromMap(this.markers);
      this.loadMap();
      if (this.runnerPositionSubscription) this.unSubscribeAllSubs();
      this.runnerMarker = undefined;
      this.loadPosition();
      // refresher.complete();
    }
    // console.log(' MapComponent -> doRefresh -> event', event);
    // this.createMarkers();  
    console.log("refreshed !");
  }  

  showLoading(target) {
    if (!this.loading) {
      if(target === 'map') {
        this.loading = this.loadingCtrl.create({
          content: 'Loading map...'
        });
          this.loading.present();
      } else if (target === 'position') {
        this.loading = this.loadingCtrl.create({
          content: 'Loading position...'
        });
          this.loading.present();
      }  
    }
  }

  dismissLoading(error?) {
      if (this.loading) {
          this.loading.dismiss();
          this.loading = null;
          if (error) {
            alert(error);
          }
      }
  }

  loadMap() {
    this.showLoading('map');
    this.map = this.initMap();
    this.mapOptions.center = this.runnerMapPosition === undefined ? this.location : this.runnerMapPosition;
    console.log(' MapComponent -> loadMap -> this.locations', this.locations);
    this.getMarkers();
    this.dismissLoading();
  }

  loadPosition() {
    if (this.loading) this.dismissLoading();
    this.showLoading('position');
    this.runnerPosition = this.geoService.runnerPosObs;
    this.runnerPosition.takeUntil(this.ngUnsubscribe).subscribe( pos => {
      if (pos !== undefined) {
        // console.log(' MapComponent -> loadPosition -> pos', pos);
        this.runnerLocationLat = pos.coords.latitude;
        this.runnerLocationLng = pos.coords.longitude;
        this.runnerMapPosition = new LatLng(this.runnerLocationLat, this.runnerLocationLng);
        if (this.runnerMarker === undefined) {
          this.addRunnerMarker();
        }
        this.dismissLoading();
      } else {
        // console.log(' MapComponent -> loadPosition -> pos === undefined');
        this.dismissLoading('Could not get your position. Please retry later');
      }  
    },
    error => {          
      this.dismissLoading(error);
      // console.log(' MapComponent -> loadPosition -> error', error);
    });
  } 

  initMap() {
    let element = this.map_canvas.nativeElement;
    this.map = new google.maps.Map(element, this.mapOptions);            
    console.log(' MapComponent -> initMap() this.map: ', this.map);
    return this.map;
  }    
  
  getMarkers() {
    switch(this.mapConfig) {
      case 'map-page':
        this.geoService.getLocations().subscribe( locs => {
          this.locations = locs;      
          // console.log(' MapComponent -> getMarkers -> this.locations', this.locations);
          this.addMarkersToMap(this.locations);   
        });
        break;
      case 'detail-page':
        this.locations = this.taskLocations;
        if (this.runType === RunType.THREELEGS) {
          this.threeLocations = this.locations.map( loc => loc);
          this.threeLocations.push(this.festival);
          // console.log(' MapComponent -> getMarkers -> threeLocations', this.threeLocations);
          this.addMarkersToMap(this.threeLocations);
        } else {          
          this.addMarkersToMap(this.locations);
        }
        break;         
    }
  }

  addMarkersToMap(locations) {
    for (let location of locations) {
      let position = new google.maps.LatLng(location.coord.latitude, location.coord.longitude);
      let marker = new google.maps.Marker({
        map: this.map,
        position, 
        title: location.name,
        icon: {
          url: location['name'] !== this.FESTIVAL.NAME ? 'https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png' : 'assets/icons/m2018.png'
        }        
      });
      this.markers.push(marker);     
    }    
  } 
  
  removeMarkersFromMap(markers) {
    while(markers.length) {
      markers.pop().setMap(null);
      // console.log(' MapComponent -> removeMarkersFromMap -> markers', markers);
    }    
  }

  addRunnerMarker() {
    this.runnerMarker = new google.maps.Marker({
      map: this.map,
      title: 'My position',
      icon: 'assets/icons/m1.png',
      animation: google.maps.Animation.BOUNCE,
      position: this.runnerMapPosition
    });
    setTimeout( () => {
      this.runnerMarker.setAnimation(null);
    }, 750);
  }

  updateRunnerMarker(marker, runnerPosition) {
    marker.setPosition(runnerPosition);
  }  

  addCluster(data) {
    let markerCluster: MarkerCluster = this.map.addMarkerClusterSync({
      markers: data,
      icons: [
        {
          min: 3,
          max: 9,
          url: "./assets/markercluster/small.svg",
          label: {
            color: "white"
          }
        },
        {
          min: 10,
          url: "./assets/markercluster/large.svg",
          label: {
            color: "white"
          }
        }
      ]
    });

    markerCluster.on(GoogleMapsEvent.MARKER_CLICK).subscribe((params) => {
      let marker: Marker = params[1];
      marker.setTitle(marker.get("name"));
      // marker.setSnippet(marker.get("address"));
      marker.showInfoWindow();
    });

  }

  resolveRoute(taskStatus, runType) {
    console.log(' $$$$$$$$$$$$$$$$$$$$$$$$$$MapComponent -> resolveRoute -> taskStatus', taskStatus);
    let waypoints;
    let from = new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude);
    console.log(' $$$$$$$$$$$$$$$$$$$$$$$$$$MapComponent -> resolveRoute -> from', this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude);
    let to = new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude);
    let origin = new google.maps.LatLng(this.FESTIVAL.LAT, this.FESTIVAL.LNG);
    let destination = new google.maps.LatLng(this.FESTIVAL.LAT, this.FESTIVAL.LNG);
    let runnerPosition = new google.maps.LatLng(this.runnerLocationLat, this.runnerLocationLng);
    let departureTime = new Date(Date.now());
    debugger;
    switch(taskStatus) {      
      case RunStatus.NOT_STARTED:
        switch(runType) {
          case RunType.DROPOFF:
            waypoints = [{
              location: to,
              stopover: true
            }]
          debugger;
          break;
          case RunType.PICKUP:
            waypoints = [{
              location: from,
              stopover: true
            }]
          debugger;
          break;          
          case RunType.THREELEGS:
          console.error(' MapComponent -> resolveRoute -> taskLocations[0]', this.taskLocations[0]);
          console.error(' MapComponent -> resolveRoute -> taskLocations[1]', this.taskLocations[1]);
          // let locationOne = "place_id:" + this.taskLocations[0]["place_id"];
          let locationOne = new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude);
          // let locationTwo = "place_id:" + this.taskLocations[1]["place_id"];
          let locationTwo = new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude);

          debugger;
          waypoints = [
            {
              location: locationOne,
              stopover: true
            },
            {
              location: locationTwo,
              stopover: true
            }
          ]
          console.error(' MapComponent -> resolveRoute -> waypoints', waypoints);
          debugger;
          break;
        }
        departureTime = new Date(this.runStartAt);
        break;
      case RunStatus.STARTED:      
        origin = this.hasStarted ? 
          (runnerPosition !== undefined ? runnerPosition : origin) : origin;
        // console.log(' ********************MapComponent -> resolveRoute -> origin', origin);
        destination = runType === RunType.DROPOFF ? to : from;
        // console.log(' *******************MapComponent -> resolveRoute -> destination', destination);
        debugger;
        break;
      case RunStatus.ARRIVED_AT_DESTINATION:
        origin = runType === RunType.DROPOFF ? to : from;
        destination = runType === RunType.DROPOFF ? from : to; 
        debugger;
        break;
      case RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION:
        origin = this.hasStarted ?
                  (runnerPosition !== undefined ? runnerPosition : from) : from;
        destination = to;
        debugger;
        break;
      case RunStatus.ARRIVED_AT_SECOND_DESTINATION:
        origin = this.hasStarted ?
                  (runnerPosition !== undefined ? runnerPosition : to) : to;
        debugger;
        break;
      case RunStatus.ON_THE_WAY_BACK:
        if (this.hasStarted) {
          if (runnerPosition !== undefined) {
            origin = runnerPosition;
          } else {
            if (runType === RunType.DROPOFF || RunType.THREELEGS) {
              origin = to;
            } else {
              origin = from;
            }
          }
        } else {
          if (runType === RunType.DROPOFF || RunType.THREELEGS) {
            origin = to;
          } else {
            origin = from
          }
        }
        // origin = this.hasStarted ?
        //       (runnerPosition !== undefined ? runnerPosition :                        
        //         runType === RunType.DROPOFF || RunType.THREELEGS ?
        //         to : from) :
        //       (runType === RunType.DROPOFF || RunType.THREELEGS ?
        //       to : from)
        debugger;
        break;
      case RunStatus.COMPLETED:
        debugger;
        switch(runType) {
          case RunType.DROPOFF:
            waypoints = [{
              location: to,
              stopover: true
            }]
            debugger;
            break;
          case RunType.PICKUP:
            waypoints = [{
              location: from,
              stopover: true
            }]
            debugger;
            break;
          case RunType.THREELEGS:
          let locationOne = new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude);
          let locationTwo = new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude);
            waypoints = [
              {
                location: locationOne,
                stopover: true
              },
              {
                location: locationTwo,
                stopover: true
              }
            ]
            debugger;
            break;
          }
    }

    if (waypoints !== undefined) {
      this.route = {
        origin,
        destination,  
        waypoints,
        travelMode: 'DRIVING',
        drivingOptions: {
          departureTime,
          trafficModel: 'pessimistic'
        }
      }; 
    } else {
      this.route = {
        origin,
        destination,  
        travelMode: 'DRIVING',
        drivingOptions: {
          departureTime,
          trafficModel: 'pessimistic'
        }
      };
    }
    debugger;
    console.log(' resolveRoute -> this.route', this.route);     
    // if (this.hasStarted ===) {
    //   this.returnDirections(taskStatus, this.route);
    //   setTimeout( () => {
    //     this.displayRoute(this.directions);
    //     this.resolveRoute(taskStatus, runType);
    //   },1000);
    // }   
  }

  returnDirections(route) {
    debugger;
    this.directionsService.route(route,
        (response, status) => {
          if (status === 'OK') {
            // console.log(' MapComponent -> returnDirections -> response', response);
            this.directions = response;
            this.legs = this.directions.routes[0].legs;
            // console.log(' MapComponent -> returnDirections -> this.legs.length', this.legs.length);
            this.distance = this.directions.routes[0].legs[0].distance.value;
            this.duration = this.directions.routes[0].legs[0].duration.value;
            this.distanceTravelled;
            this.directionsChange.emit({distance: this.distance, duration: this.duration});
            debugger;
            console.log('this.directionsChange.emit({distance: this.distance, duration: this.duration})', this.directionsChange)
            if (this.legs.length === 2 ) {
              this.legOneDistance = this.legs[0].distance.value;
              this.legOneDuration = this.legs[0].duration.value;
              this.legTwoDistance = this.legs[1].distance.value;
              this.legTwoDuration = this.legs[1].duration.value;
            } else if ( this.legs.length === 3 ) {
              this.legOneDistance = this.legs[0].distance.value;
              this.legOneDuration = this.legs[0].duration.value;
              this.legTwoDistance = this.legs[1].distance.value;
              this.legTwoDuration = this.legs[1].duration.value;
              this.legThreeDistance = this.legs[2].distance.value;
              this.legThreeDuration = this.legs[2].duration.value;
            }
            // if (runStatus === (
            //   RunStatus.STARTED ||
            //   RunStatus.ON_THE_WAY_BACK ||
            //   RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION)) {
            //     this.hasStarted = true;
            // }
            
            // console.log(' ££££££££££££££££££££££££££MapComponent -> returnDirections -> this.directions', this.directions);
            // this.returnAndUpdateRideData(this.taskStatus, this.directions);
             
          } else {
            window.alert('Directions request failed due to ' + status);        
          }
        }
      );
      debugger;
  }

  displayRoute(directions) {
    this.directionsDisplay.setOptions({
      polylineOptions: {
        strokeColor: '#00acc1'
      }
    }); 
    // console.log(' MapComponent -> displayRoute -> this.directionsDisplay', this.directionsDisplay);
    this.directionsDisplay.setOptions( { suppressMarkers: true } );
    this.directionsDisplay.setDirections(directions);
    this.directionsDisplay.setMap(this.map); 
          
  }    

  returnAndUpdateRideData(status, directions) {
    console.log(' returnAndUpdateRideData -> this.hasStarted', this.hasStarted);
    debugger;
    // if( (this.legOneDistance && this.legOneDuration === undefined) &&
    //     (this.legTwoDistance && this.legTwoDuration === undefined)) {
    //       this.getRunDistancesAndDurationsToUpdateAndDisplay(this.runId, status);
    // } else {

    if (this.hasStarted === true){
      debugger;
      switch(status) {
        case RunStatus.STARTED:
        debugger;
          // console.log(' ********************* $$$$$$$$ MapComponent -> returnAndUpdateRideData -> this.hasStarted', this.hasStarted);
          this.distanceTravelled = this.legOneDistance - this.distance;
          // console.log(' MapComponent -> returnAndUpdateRideData -> this.distanceTravelled', this.distanceTravelled);
          this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
          this.legOnePercentageDistanceTravelled = this.calculatePercentageDone(this.distance, this.legOneDistance, this.duration, this.legOneDuration);
          this.legPercentageDistanceTravelled.emit(this.legOnePercentageDistanceTravelled);
          this.rideData = {
            "legs.one.percent_dist_travelled": this.legOnePercentageDistanceTravelled
          }    
          break;

        case RunStatus.ARRIVED_AT_DESTINATION:
          debugger;
          // console.log(' MapComponent -> returnAndUpdateRideData -> this.run', this.run);
          // console.log(' MapComponent -> returnAndUpdateRideData -> this.legDistance', this.legDistance);
          
          this.distanceTravelled = this.legOneDistance;
          this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
          this.legOnePercentageDistanceTravelled = 100;
          this.rideData = {
            "legs.one.completed_at": new Date(Date.now()),
            "legs.one.percent_dist_travelled": 100 // this.legOnePercentageDistanceTravelled
          }                    
          this.hasStarted = false;
          debugger;  
          break;
  
        case RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION:

          this.distanceTravelled = this.legOneDistance + (this.legTwoDistance - this.distance);
          this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
          this.legThreePercentageDistanceTravelled = this.calculatePercentageDone(this.distance, this.legThreeDistance, this.duration, this.legThreeDuration);
          this.legPercentageDistanceTravelled.emit(this.legThreePercentageDistanceTravelled);
          this.rideData = {
            "legs.three.percent_dist_travelled": this.legThreePercentageDistanceTravelled            
          }    
          break;
  
        case RunStatus.ARRIVED_AT_SECOND_DESTINATION:    
          this.distanceTravelled = this.legOneDistance + this.legTwoDistance;
          this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
          this.legTwoPercentageDistanceTravelled = 100;
          this.rideData = {
            "legs.two.completed_at": new Date(Date.now()),
            "legs.two.percent_dist_travelled": 100 // this.legOnePercentageDistanceTravelled
          }     
          this.hasStarted = false;
          break;
  
        case RunStatus.ON_THE_WAY_BACK:
          debugger;
          if (this.runType !== RunType.THREELEGS) {
            this.distanceTravelled = this.distanceTravelled + (this.legTwoDistance - this.distance);            
            this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
            this.legTwoPercentageDistanceTravelled = this.calculatePercentageDone(this.distance, this.legTwoDistance, this.duration, this.legTwoDuration);
            this.legPercentageDistanceTravelled.emit(this.legTwoPercentageDistanceTravelled);
            this.rideData = {
              "legs.two.percent_dist_travelled": this.legTwoPercentageDistanceTravelled
            };
          } else if (this.runType === RunType.THREELEGS) {
            this.distanceTravelled = this.legOneDistance + this.legTwoDistance + (this.legThreeDistance - this.distance);
            this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
            this.legThreePercentageDistanceTravelled = this.calculatePercentageDone(this.distance, this.legThreeDistance, this.duration, this.legThreeDuration);
            this.legPercentageDistanceTravelled.emit(this.legThreePercentageDistanceTravelled);
            this.rideData = {
              "legs.three.percent_dist_travelled": this.legThreePercentageDistanceTravelled            
            }
          }
          debugger;
          break;
        case RunStatus.COMPLETED:
          if (this.runType === RunType.THREELEGS) {
            this.legThreePercentageDistanceTravelled = 100;
            this.rideData = {
              "legs.three.completed_at": new Date(Date.now()).toString(),
              "legs.three.percent_dist_travelled": 100,
              "percent_dist_travelled": 100
            }
          } else {
            this.legTwoPercentageDistanceTravelled = 100;
            this.rideData = {
              "legs.two.completed_at": new Date(Date.now()).toString(),
              "legs.two.percent_dist_travelled": 100,
              "percent_dist_travelled": 100
            }
          }
          this.hasStarted = false;
          this.percentageOfTotalDistTravelled = 100;            
          break;
      };
    } else if (this.hasStarted === false) {
      debugger;
      switch(status) {
        case RunStatus.NOT_STARTED:
          let distance_total = 0;
          let duration_total = 0;
          this.legs = directions.routes[0].legs;
          this.distanceTravelled = 0;
          this.legs.forEach( leg => {
            distance_total += leg.distance.value;
            duration_total += leg.duration.value;
          });
          this.rideData = {
            "distance_total": distance_total,
            "duration_total": duration_total,
            "legs.one.distance": this.legOneDistance,
            "legs.one.duration": this.legOneDuration,
          }; 
          this.hasStarted = false;   
          break;
        case RunStatus.STARTED:
          // console.log(' ********************* $$$$$$$$ MapComponent -> returnAndUpdateRideData -> this.hasStarted', this.hasStarted);
          // this.leg = response.route[0].legs[0];
          debugger;
          this.startedAt = new Date(Date.now());
          this.startedAtTS = firebase.firestore.Timestamp.fromDate(this.startedAt);
          this.startedAtUpdate.emit(this.startedAtTS);
          debugger;
          this.rideData = {
              "started_at": this.startedAtTS,
              "legs.one.distance": this.distance,
              "legs.one.duration": this.duration,
              "legs.one.started_at": this.startedAtTS,
              "percent_dist_travelled": 0,
              "distance_travelled": 0,           
              "legs.one.percent_dist_travelled": 0,                 
            }
              
          console.log(' MapComponent -> returnAndUpdateRideData ->  this.rideData',  this.rideData);
          this.hasStarted = true;
          debugger;
          break;
        case RunStatus.ARRIVED_AT_DESTINATION: 
          // console.log(' MapComponent -> returnAndUpdateRideData -> this.run', this.run);
          // console.log(' MapComponent -> returnAndUpdateRideData -> this.legOneDistance', this.legOneDistance);
          this.distanceTravelled = this.legOneDistance;
          this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
          this.legOnePercentageDistanceTravelled = 100;
          this.rideData = {
            "percent_dist_travelled": this.percentageOfTotalDistTravelled,
            "legs.one.completed_at": new Date(Date.now()),
            "legs.one.percent_dist_travelled": 100 // this.legOnePercentageDistanceTravelled
          }          
          this.hasStarted = false;
          debugger;  
          break;
  
        case RunStatus.ON_THE_WAY_TO_SECOND_DESTINATION:
          // console.log(' MapComponent -> returnAndUpdateRideData -> this.legs', this.legs);
          this.distanceTravelled = this.legOneDistance + this.legTwoDistance + (this.legThreeDistance - this.distance);
          this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
          this.rideData = {
            "percent_dist_travelled": this.percentageOfTotalDistTravelled,
            "legs.three.distance": this.distance,
            "legs.three.duration": this.duration,
            "legs.three.started_at": new Date(Date.now()).toString(),
            "legs.three.percent_dist_travelled": 0
          }                
        this.hasStarted = true;
          break;

        case RunStatus.ARRIVED_AT_SECOND_DESTINATION:
          this.distanceTravelled = this.legOneDistance + this.legTwoDistance;
          this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
          this.legTwoPercentageDistanceTravelled = 100;
          this.rideData = {
            "percent_dist_travelled": this.percentageOfTotalDistTravelled,
            "legs.two.completed_at": new Date(Date.now()),
            "legs.two.percent_dist_travelled": 100 // this.legOnePercentageDistanceTravelled
          }
          this.hasStarted = false;
          break;
  
        case RunStatus.ON_THE_WAY_BACK:
          debugger;
          if (this.runType !== RunType.THREELEGS) {    
            this.distanceTravelled = this.legOneDistance + (this.legTwoDistance - this.distance);
            this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
            this.rideData = {
              "legs.two.distance": this.distance,
              "legs.two.duration": this.duration,
              "legs.two.started_at": new Date(Date.now()).toString(),
              "legs.two.percent_dist_travelled": 0                    
            } 
            debugger;                         
          } else if (this.runType === RunType.THREELEGS) {
            // console.log(' MapComponent -> returnAndUpdateRideData -> this.legs', this.legs);
            this.distanceTravelled = this.legOneDistance + this.legTwoDistance + (this.legThreeDistance - this.distance);
            this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
            this.rideData = {
              "legs.three.distance": this.distance,
              "legs.three.duration": this.duration,
              "legs.three.started_at": new Date(Date.now()).toString(),
              "legs.three.percent_dist_travelled": 0                    
            }            
          }
          this.hasStarted = true;
          debugger;
          break;
        case RunStatus.COMPLETED:
          break;
      };
    }

    if (!(status === RunStatus.COMPLETED && this.hasStarted === false)) {
      this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
      this.rideData["status"] = status;
      this.rideData["distance_travelled"] = this.distanceTravelled;
      this.rideData["percent_dist_travelled"] = this.percentageOfTotalDistTravelled;

      // console.log(' MapComponent -> returnAndUpdateRideData -> this.directions', this.directions);
      this.runzService.updateRun(this.runId, this.rideData).then( () => {
      
        this.displayRoute(this.directions);
      });
    } else {
      this.displayRoute(this.directions);
    }  
  } 
  
  calculateTotalPercentageDone(distance, distance_total) {
    let percentageDistanceDone = (distance * 100) / distance_total;
    // console.log(' MapComponent -> calculateTotalPercentageDone -> percentageDistanceDone', percentageDistanceDone);
    return Math.round(percentageDistanceDone);
  }

  calculatePercentageDone(distance, legDistance, duration , legDuration) {
    let percentageDistanceDone = ((legDistance - distance) * 100) / legDistance;
    // console.log(' MapComponent -> calculatePercentageDone -> percentageDistanceDone', percentageDistanceDone);
    
    let percentageDurationDone = ((legDuration - duration)  * 100) / legDuration;
    // console.log(' MapComponent -> calculatePercentageDone -> percentageDurationDone', percentageDurationDone);
    let percentageDistanceAndDurationAverage = (percentageDistanceDone + percentageDurationDone) / 2;
    // console.log(' MapComponent -> calculatePercentageDone -> percentageDistanceAndDurationAverage', percentageDistanceAndDurationAverage);
    return Math.round(percentageDistanceAndDurationAverage);
  }

  getSegmentedDirections(directions): any[] {
    let route = directions.directions.routes[0];
    let legs = route.legs;
    let path = [];
    let increments = [];
    let duration = 0;

    let numOfLegs = legs.length;

    // work backwards through each leg directions route
    while (numOfLegs--) {
      let leg = legs[numOfLegs];
      let steps = leg.steps;
      let numOfSteps = steps.length;

      while (numOfSteps--) {
        let step = steps[numOfSteps];
        let points  = step.path;
        let numOfPoints = points.length;

        duration += step.duration.value;        

        while(numOfPoints--) {
          let point = points[numOfPoints];

          path.push(point);

          increments.unshift({
            position: point, // car position
            time: duration, // time left before arrival
            path: path.slice(0) // clone array to prevent referencing final path array
          })
        }
      }
    }
    return increments;
  }  
  
}  


// If one of the run's leg hasn't been started yet
            // the legDistance equals the total distance
            // this.distance is the runner's distance from next destination  
            // this.legDistance = this.distance;
            // this.legDuration = this.duration;
            
            // this.returnAndUpdateRideData(taskStatus, response);
            // if (this.taskType === 'threeLegs')
            //   this.leg = response.route[0].legs[0];  
            

            