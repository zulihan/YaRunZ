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
  Output
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

// import { google } from 'google.maps';
declare var google: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html'
})

export class MapComponent implements OnInit {
  // TODO: use enums

  @ViewChild('map_canvas') map_canvas: ElementRef;

  // @Input('mapModal') mapModal;

  // @Input('taskLocations') tlocations; 

  @Input('mapConfig') mapConfig;

  @Input('taskLocations') taskLocations; 

  @Input('taskStatus') taskStatus; 

  @Input('taskType') runType;  

  @Input('runId') runId;

  // @Output() onMapClicked = new EventEmitter<any>();
  FESTIVAL = env.FESTIVAL;
  run;
  runSubscription;
  
  locations = [];

  runnerPosition: Observable<Geoposition>;
  runnerLocationLat;
  runnerLocationLng;
  runnerMapPosition;
  
  // TODO: change for a global
  location = new google.maps.LatLng(43.293532942394684, 5.3792383398000439);
  map;
  markers = [];
  runnerMarker;

  mapOptions =  {
    mapTypeId: google.maps.MapTypeId.ROADMAP, 
    center: this.location,
    zoom: 14, 
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
  duration;
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
    
  }

  ionViewDidLoad() {  
    // TODO: send request with run id  
    // this.runSubscription = this.runzService.getRun(this.runId).subscribe( run => {
    //   this.run = run;
    // })
  }

  ngAfterViewInit() { 
     
    this.platform.ready().then( () => {
      this.loadPosition();
      console.log(' MapComponent -> ngAfterViewInit -> this.runnerPosition', this.runnerPosition);
      console.log(' MapComponent -> ngAfterViewInit -> this.mapConfig', this.mapConfig);
      console.log(' MapComponent -> ngAfterViewInit -> this.taskLocations', this.taskLocations);

      if (this.taskStatus === RunStatus.STARTED || this.taskStatus === RunStatus.ON_THE_WAY_BACK) {
        this.hasStarted = true;
      }
      
      this.map = this.initMap();
      this.getMarkers();
      if (this.mapConfig === 'detail-page') {
        console.log(' MapComponent -> ngAfterViewInit -> this.runId', this.runId);
        if (this.distance_total === undefined || this.duration_total === undefined) {
        //   this.runSubscription = this.runzService.getRun(this.runId).subscribe( run => {
        //     console.log(' MapComponent -> ngAfterViewInit -> doc', run);
        //     this.run = run as any;
        //     this.legs = this.run.legs;
        //     this.distance_total = this.run.distance_total;
        //     this.duration_total = this.run.duration_total;
        //     this.resolveRoute(this.taskStatus);
        //     this.returnDirections(this.taskStatus, this.route);
        //   })
          this.runzService.getRun(this.runId)
            .then((doc) => {
              if (doc.exists) {
                  console.log("Document data:", doc.data());
                  this.run = doc.data();
                  this.legs = this.run.legs;
                  this.distance_total = this.run.distance_total;
                  this.duration_total = this.run.duration_total;
                  this.resolveRoute(this.taskStatus, this.runType);
                  this.returnDirections(this.taskStatus, this.route);
              } else {
                  console.log("No such document!");
              }
            }).catch(function(error) {
                console.log("Error getting document:", error);
            });
          
          console.log(' *************MapComponent -> ngAfterViewInit -> this.run*****************', this.run);
         
        }          
      }
    })     
  }

  doRefresh(state) {
    console.log(' MapComponent -> doRefresh -> this.markers', this.markers);
    if (state !== 0) {
      this.removeMarkersFromMap(this.markers);
      this.loadPosition();
      this.initMap();
      this.getMarkers();
    }
    console.log(' MapComponent -> doRefresh -> event', event);
    // this.createMarkers();  
    console.log("refreshed !");
  }  

  showLoading() {
    if (!this.loading) {
      this.loading = this.loadingCtrl.create({
        content: 'Loading position...'
      });
        this.loading.present();
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

  loadPosition() {
    this.showLoading();    
    this.runnerPosition = this.geoService.runnerPosObs;
    this.runnerPosition.subscribe( pos => {
      if (pos !== undefined) {
        console.log(' MapComponent -> loadPosition -> pos', pos);
        this.runnerLocationLat = pos.coords.latitude;
        this.runnerLocationLng = pos.coords.longitude;
        this.runnerMapPosition = new LatLng(this.runnerLocationLat, this.runnerLocationLng);
        this.dismissLoading();
        if(this.runnerMarker !== undefined) {
          this.updateRunnerMarker(this.runnerMarker, this.runnerMapPosition);
        }
      } else {
        console.log(' MapComponent -> loadPosition -> pos === undefined');
        setTimeout( () => this.dismissLoading('Could not get your position. Please retry later' ), 7000);
        // this.loading.dismiss();
      }  
    },
    error => {          
      this.dismissLoading(error);
      console.log(' MapComponent -> loadPosition -> error', error);
    });
  }

  initMap() {
    let element = this.map_canvas.nativeElement;
    this.map = new google.maps.Map(element, this.mapOptions);            
    console.log(' MapComponent -> initMap() this.map: ', this.map);     
    return this.map;                  
  }    
  
  getMarkers() {
    if ( this.mapConfig === 'map-page') {
      this.geoService.getLocations().subscribe( locs => {
        this.locations = locs;      
        console.log(' MapComponent -> getMarkers -> this.locations', this.locations);
        this.addMarkersToMap(this.locations);   
      });
    } else {
      this.addMarkersToMap(this.taskLocations);      
    }
    this.addRunnerMarker();       
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
      console.log(' MapComponent -> removeMarkersFromMap -> markers', markers);
    }    
  }

  addRunnerMarker() {
    this.runnerMarker = new google.maps.Marker({
      map: this.map,
      title: 'Zu position',
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
    let route = {};
    let from;

    switch(taskStatus) {
      case RunStatus.NOT_STARTED:
        this.route = {
          origin: new google.maps.LatLng(this.FESTIVAL.LAT, this.FESTIVAL.LNG),
          destination: new google.maps.LatLng(this.FESTIVAL.LAT, this.FESTIVAL.LNG),  
          waypoints: [ 
            {
              location: runType = RunType.DROPOFF ? 
                new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude):
                new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude),
              stopover: true
            }        
          ],
          travelMode: 'DRIVING'
        };      
        console.log(' MapComponent -> resolveRoute -> route', route);
        break;
      case RunStatus.STARTED:      
        from = !this.hasStarted ?
          new google.maps.LatLng(this.FESTIVAL.LAT, this.FESTIVAL.LNG) :        
          new google.maps.LatLng(this.runnerLocationLat, this.runnerLocationLng);
        this.route = {
          origin: from,
          destination: runType = RunType.DROPOFF ? 
            new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude):
            new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude),
          travelMode: 'DRIVING'
        };
        if (!this.hasStarted) {
          this.returnDirections(taskStatus, route);
          this.displayRoute(this.directions);
          this.hasStarted = true;
          this.resolveRoute(taskStatus, runType);
        }        
        break;
      case RunStatus.ARRIVED_AT_DESTINATION:
        this.route = {
          origin: runType = RunType.DROPOFF ? 
            new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude):
            new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude),
          destination: new google.maps.LatLng(this.FESTIVAL.LAT, this.FESTIVAL.LNG),          
          travelMode: 'DRIVING'
      };
        break;
      case RunStatus.ON_THE_WAY_BACK:
        from = this.hasStarted ?
          new google.maps.LatLng(this.runnerLocationLat, this.runnerLocationLng) :
          runType = RunType.DROPOFF ? 
            new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude) :
            new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude)  
        this.route = {
          origin: from,
          destination: new google.maps.LatLng(this.FESTIVAL.LAT, this.FESTIVAL.LNG),          
          travelMode: 'DRIVING'
        };  
    }
  }

  returnDirections(taskStatus, route) {
    if(taskStatus !== RunStatus.COMPLETED) {
      this.directionsService.route(route,
        (response, status) => {
          if (status === 'OK') {
            console.log(' MapComponent -> returnDirections -> response', response);
            this.directions = response;
            this.distance = response.routes[0].legs[0].distance.value;
            this.duration = response.routes[0].legs[0].duration.value;
            // If one of the run's leg hasn't been started yet
            // the legDistance equals the total distance
            // this.distance is the runner's distance from next destination 
            if (this.hasStarted === false) {
              this.legDistance = this.distance;
              this.legDuration = this.duration;
            } else {
              // TODO: else
            }
            this.returnAndUpdateRideData(taskStatus, response);
            // if (this.taskType === 'threeLegs')
            //   this.leg = response.route[0].legs[0];  
            
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
    }
  }

  displayRoute(directions) {   
    this.directionsDisplay.setOptions({
      polylineOptions: {
        strokeColor: '#00acc1'
      }
    }); 
    this.directionsDisplay.setDirections(directions);
    this.directionsDisplay.setMap(this.map); 
    this.directionsDisplay.setOptions( { suppressMarkers: true } );      
  }    

  returnAndUpdateRideData(status, response) {   

    switch(status) {
      // TODO: implement threeLegs case
      case RunStatus.NOT_STARTED:
        this.initialDirections = response;
        this.legs = this.initialDirections.routes[0].legs;
        let distance_total = 0;
        let duration_total = 0;
        this.legs.forEach( leg => {
          distance_total += leg.distance.value;
          duration_total += leg .duration.value;
        });
        this.rideData = {
          "distance_total": distance_total,
          "duration_total": duration_total
        };
        // this.runzService.runInit(this.legs, this.task);
        this.runzService.updateRun(this.runId, this.rideData).then( () => {
          this.displayRoute(this.directions);
        });
        break;
      case RunStatus.STARTED:
        // this.leg = response.route[0].legs[0];        
        if (!this.hasStarted) { 
          this.rideData = {
            "status": RunStatus.STARTED,
            "percent_dist_travelled": 0,
            "dist_travelled": 0,
            "legs.one.distance": this.distance,
            "legs.one.duration": this.duration,
            "legs.one.started_at": new Date(Date.now()),
            "legs.one.percent_dist_travelled": 0                       
          }
          this.runzService.updateRun(this.runId, this.rideData).then( () => {
            this.displayRoute(this.directions);
            this.hasStarted = true;
          });          
        } else {
          if (this.legDistance !== undefined && this.legDuration !== undefined) {
            this.distanceTravelled = this.legDistance - this.distance;
            this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
            this.legOnePercentageDistanceTravelled = this.calculatePercentageDone(this.distance, this.legDistance, this.duration, this.legDuration);
            this.rideData = {
              "status": RunStatus.STARTED,
              "dist_travelled": this.distanceTravelled,
              "percent_dist_travelled": this.percentageOfTotalDistTravelled,
              "legs.one.percent_dist_travelled": this.legOnePercentageDistanceTravelled            
            }
            this.runzService.updateRun(this.runId, this.rideData).then( () => {
              this.displayRoute(this.directions);
            });
          } else {
            this.runzService.getRun(this.runId).then( doc => {
              let run = doc.data() as any;            
              console.log(' MapComponent -> returnAndUpdateRideData -> doc', doc);
              console.log(' MapComponent -> returnAndUpdateRideData -> doc.legs', run.legs.one.distance);
              this.legDistance = run.legs.one.distance;
              this.legDuration = run.legs.one.duration;
              this.distanceTravelled = this.legDistance - this.distance;
              this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
              this.legOnePercentageDistanceTravelled = this.calculatePercentageDone(this.distance, this.legDistance, this.duration, this.legDuration);
              this.rideData = {
                "status": RunStatus.STARTED,
                "dist_travelled": this.distanceTravelled,
                "percent_dist_travelled": this.percentageOfTotalDistTravelled,
                "legs.one.percent_dist_travelled": this.legOnePercentageDistanceTravelled            
              }
              this.runzService.updateRun(this.runId, this.rideData).then( () => {
                this.displayRoute(this.directions);
              });
            })
          }
          
        }    
        break;
      case RunStatus.ARRIVED_AT_DESTINATION: 
        console.log(' MapComponent -> returnAndUpdateRideData -> this.run', this.run);
        console.log(' MapComponent -> returnAndUpdateRideData -> this.legDistance', this.legDistance);
        
        this.distanceTravelled = this.legDistance;
        this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
        this.legOnePercentageDistanceTravelled = 100;
        this.rideData = {
          "status": RunStatus.ARRIVED_AT_DESTINATION,
          "dist_travelled": this.legDistance,
          "percent_dist_travelled": this.percentageOfTotalDistTravelled,
          "legs.one.completed_at": new Date(Date.now()),
          "legs.one.percent_dist_travelled": this.legOnePercentageDistanceTravelled
        }
        this.runzService.updateRun(this.runId, this.rideData).then( () => {
          this.displayRoute(this.directions);
        }); 
        this.hasStarted = false;  
        break;
      case RunStatus.ON_THE_WAY_BACK:
        if (!this.hasStarted) {
          console.log(' MapComponent -> returnAndUpdateRideData -> this.legs', this.legs);
          this.distanceTravelled = this.legs[0].distance.value + (this.legDistance - this.distance);
          this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
          this.rideData = {
            "status": RunStatus.ON_THE_WAY_BACK,
            "percent_dist_travelled": this.percentageOfTotalDistTravelled,
            "legs.two.distance": this.distance,
            "legs.two.duration": this.duration,
            "legs.two.started_at": new Date(Date.now()),
            "legs.two.percent_dist_travelled": 0                    
          }
          this.hasStarted = true;
          this.runzService.updateRun(this.runId, this.rideData).then( () => {
            this.displayRoute(this.directions);
          });
        } else {
          // TODO: forgot what to do
          if (this.legDistance !== undefined && this.legDuration !== undefined) {
            this.distanceTravelled = this.run.dist_travelled + (this.legDistance - this.distance);
            this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
            this.legTwoPercentageDistanceTravelled = this.calculatePercentageDone(this.distance, this.legDistance, this.duration, this.legDuration);
            this.rideData = {
              "status": RunStatus.ON_THE_WAY_BACK,
              "dist_travelled": this.distanceTravelled,
              "percent_dist_travelled": this.percentageOfTotalDistTravelled,
              "legs.one.percent_dist_travelled": this.legTwoPercentageDistanceTravelled            
            }
            this.runzService.updateRun(this.runId, this.rideData).then( () => {
              this.displayRoute(this.directions);
            });
          } else {
            this.runzService.getRun(this.runId)
            .then((doc) => {
              this.run = doc.data();
              this.distanceTravelled = this.run.dist_travelled + (this.legDistance - this.distance);            
              this.legDistance = this.run.legs.two.distance;
              this.legDuration = this.run.legs.two.duration;
              this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
              this.legTwoPercentageDistanceTravelled = this.calculatePercentageDone(this.distance, this.legDistance, this.duration, this.legDuration);
              this.rideData = {
                "status": RunStatus.ON_THE_WAY_BACK,
                "percent_dist_travelled": this.percentageOfTotalDistTravelled,
                "legs.two.percent_dist_travelled": this.legTwoPercentageDistanceTravelled               
              };
              this.runzService.updateRun(this.runId, this.rideData).then( () => {
                this.displayRoute(this.directions);
              });
            })
          }
              
        }
        break;
      case RunStatus.COMPLETED:
        this.hasStarted = false;
        this.percentageOfTotalDistTravelled = 100;
        this.legTwoPercentageDistanceTravelled = 100;
        this.rideData = {
          "status": RunStatus.COMPLETED,
          "legs.two.completed_at": new Date(Date.now()),
          "legs.two.percent_dist_travelled": 100,
          "percent_dist_travelled": 100
        }
        break;
    };    
    // return this.rideData;    
  }

  calculateTotalPercentageDone(distance, distance_total) {
    let percentageDistanceDone = (distance * 100) / distance_total;
    console.log(' MapComponent -> calculateTotalPercentageDone -> percentageDistanceDone', percentageDistanceDone);
    
    return Math.round(percentageDistanceDone);
  }

  calculatePercentageDone(distance, legDistance, duration , legDuration) {
    let percentageDistanceDone = ((legDistance - distance) * 100) / legDistance;
    console.log(' MapComponent -> calculatePercentageDone -> percentageDistanceDone', percentageDistanceDone);
    
    let percentageDurationDone = ((legDuration - duration)  * 100) / legDuration;
    console.log(' MapComponent -> calculatePercentageDone -> percentageDurationDone', percentageDurationDone);
    let percentageDistanceAndDurationAverage = (percentageDistanceDone + percentageDurationDone) / 2;
    console.log(' MapComponent -> calculatePercentageDone -> percentageDistanceAndDurationAverage', percentageDistanceAndDurationAverage);
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

  calculateRouteLeft() {
    // 
  }  
  
}  

