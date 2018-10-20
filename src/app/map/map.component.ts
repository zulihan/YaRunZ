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

  @ViewChild('map_canvas') map_canvas: ElementRef;

  // @Input('mapModal') mapModal;

  // @Input('taskLocations') tlocations; 

  // tlocations;

  @Input('mapConfig') mapConfig;

  @Input('taskLocations') taskLocations; 

  @Input('taskStatus') taskStatus; 

  @Input('taskType') taskType;  

  // @Output() onMapClicked = new EventEmitter<any>();
    
  locations = [];

  runnerPosition: Observable<Geoposition>;
  runnerLocationLat;
  runnerLocationLng;
  runnerMapPosition;
  
  location = new google.maps.LatLng(43.293532942394684, 5.3792383398000439);
  map;
  markers = [];
  runnerMarker;
  // map: GoogleMap;
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
       
  }

  ngAfterViewInit() { 
     
    this.platform.ready().then( () => {
      this.loadPosition();

      console.log('ionViewDidLoad MapPage');
      console.log('ngAfterViewInit, this.runnerPosition: ', this.runnerPosition);       
      console.log('mapConfig: ', this.mapConfig); 
      console.log('taskLocations: ', this.taskLocations);

      if (this.taskStatus === 'has started' || this.taskStatus === 'is on the way back') {
        this.hasStarted = true;
      }
      
      this.map = this.initMap();
      this.getMarkers();
      if (this.mapConfig !== 'map-page') {
        if (this.distance_total === undefined || this.duration_total === undefined) {
          this.runzService.getRun().then( doc => {
            let run = doc as any;
            this.distance_total = run.distance_total;
            this.duration_total = run.duration_total;
            this.resolveRoute(this.taskStatus);
            this.returnDirections(this.taskStatus, this.route);
          })
        }          
      }
    })
       
    // console.log('ngAfterViewInit() this.runnerPosition: ', this.runnerPosition.subscribe( pos => pos ));    
  }

  doRefresh(state) {
    console.log(' MapComponent -> doRefresh -> this.markers', this.markers);
    if (state !== 0) {
      this.removeMarkersFromMap(this.markers);
      this.loadPosition();
      this.initMap();
      this.getMarkers();
    }
    console.log('$event: ', event);   
    
    // this.createMarkers();
    
    console.log("refreshed ! ");
  }  

  showLoading() {
    if(!this.loading){
      this.loading = this.loadingCtrl.create({
        content: 'Retrieving position...'        
      });
        this.loading.present();
    }
  }

  dismissLoading(error?) {
      if (this.loading) {
          this.loading.dismiss();
          this.loading = null;
          if (error) {
            alert(error)
          }
      }
  }

  loadPosition() {
    this.showLoading();    
    this.runnerPosition = this.geoService.runnerPosObs;
    this.runnerPosition.subscribe( pos => {
      if (pos !== undefined) {
        this.runnerLocationLat = pos.coords.latitude;
        this.runnerLocationLng = pos.coords.longitude;
        this.runnerMapPosition = new LatLng(this.runnerLocationLat, this.runnerLocationLng);
        this.dismissLoading();
        if(this.runnerMarker !== undefined) {
          this.updateRunnerMarker(this.runnerMarker, this.runnerMapPosition);
        }
      } else {
        console.log('runner position error ctor: ');
        setTimeout( () => this.dismissLoading(), 7000);
        // this.loading.dismiss();
      }  
    },
    error => {          
      this.dismissLoading(error);
      console.log('runner position error ctor: ', error)
    });
  }

  initMap() {
    let element = this.map_canvas.nativeElement;
    this.map = new google.maps.Map(element, this.mapOptions);            
    console.log(' initMap() this.map: ', this.map);     
    return this.map;                  
  }    
  
  getMarkers() {
    // console.log('this.tlocations: ', this.tlocations);
    if ( this.mapConfig === 'map-page') {
      this.geoService.getLocations().subscribe( locs => {
        this.locations = locs;      
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
          url: location['name'] !== 'Marsatac' ? null : 'assets/icons/m2018.png'
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

  resolveRoute(taskStatus) {
    let route = {};
    let from;

    switch(taskStatus) {
      case 'has not started yet':
        this.route = {
          origin: new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude),
          destination: new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude),
          waypoints: [ 
            {
              location : new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude),
              stopover: true
            }        
          ],
          travelMode: 'DRIVING'
        };      
        console.log('route: ', route);
        break;
      case 'has started':
        from = this.hasStarted ?
          new google.maps.LatLng(this.runnerLocationLat, this.runnerLocationLng) :
          new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude);
        this.route = {
          origin: from,
          destination: new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude),          
          travelMode: 'DRIVING'
        };          
        break;
      case 'has arrived at destination':
        this.route = {
          origin: new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude),
          destination: new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude),          
          travelMode: 'DRIVING'
      };
        break;
      case 'is on the way back':
        from = this.hasStarted ?
          new google.maps.LatLng(this.runnerLocationLat, this.runnerLocationLng) :
          new google.maps.LatLng(this.taskLocations[1].coord.latitude, this.taskLocations[1].coord.longitude);
        this.route = {
          origin: from,
          destination: new google.maps.LatLng(this.taskLocations[0].coord.latitude, this.taskLocations[0].coord.longitude),          
          travelMode: 'DRIVING'
        };
      
    }
  }

  returnDirections(taskStatus, route) {
    if(taskStatus !== 'has completed') {
      this.directionsService.route(route,
        (response, status) => {
          if (status === 'OK') {
            console.log("response from this.directionsService.route: ", response);
            this.directions = response;
            this.returnAndUpdateRideData(taskStatus, response);
            // if (this.taskType === 'threeLegs')
            //   this.leg = response.route[0].legs[0];
            // let legs = <any>[];
            // let  directions = <any>{};
            // let runData: any;
            // let distance_total = 0;
            // let duration_total = 0;

            // if (taskStatus === 'has not started yet') {
            //   this.initialDirections = response;
              
            //   legs = this.initialDirections.routes[0].legs;
            //   legs.forEach( leg => {
            //   distance_total += leg.distance.value;
            //   duration_total += leg .duration.value
            //   });
            //   directions = {
            //     distance_total: distance_total,
            //     duration_total: duration_total
            //   }
            //   console.log('directions: ', directions)
            //   this.runzService.updateRun(directions);
            // } else {
            //   this.leg = response.routes[0].legs[0];
            //   this.rideData = this.returnRideData(taskStatus, response);
            //   this.runzService.getRun().then( doc => {
            //     console.log('%%%******* TaskDetailPage -> ionViewDidLoad -> runData', doc);
            //     legs = runData.legs;
            //     legs.forEach( leg => {
            //       distance_total += leg.distance.value;
            //       duration_total += leg .duration.value;
            //       this.distance_total = distance_total;
            //       this.duration_total = duration_total;
            //       this.runzService.updateRun(this.rideData);
            //     });
            //   });
            // }
            
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
    } 
  }

  displayRoute(directions) {    
    this.directionsDisplay.setDirections(directions);
    this.directionsDisplay.setMap(this.map); 
    this.directionsDisplay.setOptions( { suppressMarkers: true } );      
  }    

  returnAndUpdateRideData(status, response) {
    let legs = <any>[];
    this.directions = response;
    let runData: any;
    
    this.distance = response.routes[0].legs[0].distance.value;
    this.duration = response.routes[0].legs[0].duration.value;
    if (!this.hasStarted) { 
      this.legDistance = this.distance;
      this.legDuration = this.duration;
    } else {
      
    }

    switch(status) {
      // TODO: implement threeLegs case
      case 'has not started yet':
        this.initialDirections = response;
        legs = this.initialDirections.routes[0].legs;
        legs.forEach( leg => {
        this.distance_total = leg.distance.value;
        this.duration_total = leg .duration.value;
        });
        this.rideData = {
          "distance_total": this.distance_total,
          "duration_total": this.duration_total
        };
        // this.runzService.runInit(this.legs, this.task);
        this.runzService.updateRun(this.rideData).then( () => {
          this.displayRoute(this.directions);
        });
        break;
      case 'has started':
        // this.leg = response.route[0].legs[0];        
        if (!this.hasStarted) { 
          this.rideData = {
            "percent_dist_travelled": 0,
            "dist_travelled": 0,
            "legs.one.distance": this.distance,
            "legs.one.duration": this.duration,
            "legs.one.started_at": new Date(Date.now()),
            "legs.one.percent_dist_travelled": 0
                       
          }
          this.runzService.updateRun(this.rideData).then( () => {
            this.displayRoute(this.directions);
            this.hasStarted = true;
          });          
        } else {
          this.runzService.getRun().then( doc => {
            let run = doc as any;            
            console.log(' MapComponent -> returnAndUpdateRideData -> doc', doc);
            console.log(' MapComponent -> returnAndUpdateRideData -> doc.legs', run.legs.one.distance);
            this.legDistance = run.legs.one.distance;
            this.legDuration = run.legs.one.duration;
            this.distanceTravelled = this.legDistance - this.distance;            
            this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
            this.legOnePercentageDistanceTravelled = this.calculatePercentageDone(this.distance, this.legDistance, this.duration, this.legDuration);
            this.rideData = {
              "dist_travelled": this.distanceTravelled,
              "percent_dist_travelled": this.percentageOfTotalDistTravelled,
              "legs.one.percent_dist_travelled": this.legOnePercentageDistanceTravelled              
            }
            this.runzService.updateRun(this.rideData).then( () => {
              this.displayRoute(this.directions);
            });
          })  
        }
        
        break;
      case 'has arrived at destination':
        this.hasStarted = false;
        this.distanceTravelled = this.legDistance;
        this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
        this.rideData = {
          "dist_travelled": this.legDistance,
          "percent_dist_travelled": this.percentageOfTotalDistTravelled,
          "legs.one.completed_at": new Date(Date.now()),
          "legs.one.percent_dist_travelled": 100
        }
        this.runzService.updateRun(this.rideData).then( () => {
          this.displayRoute(this.directions);
        });   
        break;
      case 'is on the way back':
        if (!this.hasStarted) {
          this.rideData = {
            "percent_dist_travelled": 0,
            "legs.two.distance": this.distance,
            "legs.two.duration": this.duration,
            "legs.two.started_at": new Date(Date.now()),
            "legs.two.percent_dist_travelled": 0
                    
          }
          this.hasStarted = true;
          this.runzService.updateRun(this.rideData).then( () => {
            this.displayRoute(this.directions);
          });
        } else {
          // TODO: 
          this.runzService.getRun().then( doc => {
            let run = doc as any;
            this.legDistance = run.legs.two.distance;
            this.legDuration = run.legs.two.duration;
            this.percentageOfTotalDistTravelled = this.calculateTotalPercentageDone(this.distanceTravelled, this.distance_total);
            this.legTwoPercentageDistanceTravelled = this.calculatePercentageDone(this.distance, this.legDistance, this.duration, this.legDuration);
            this.rideData = {
              "percent_dist_travelled": this.percentageOfTotalDistTravelled,
              "legs.two.percent_dist_travelled": this.legTwoPercentageDistanceTravelled               
            }
          })
          this.runzService.updateRun(this.rideData).then( () => {
            this.displayRoute(this.directions);
          });
        }
        break;
      case 'has completed':
        this.hasStarted = false;
        this.rideData = {
          "legs.two.completed_at": new Date(Date.now()),
          "legs.two.percent_dist_travelled": 100,
          "percent_dist_travelled": 100
        }
    };
    
    
    // return this.rideData;    
  }

  calculateTotalPercentageDone(distance, distance_total) {
    let percentageDistanceDone = (distance * 100) / distance_total;
    console.log(' MapComponent -> calculateTotalPercentageDone -> percentageDistanceDone', percentageDistanceDone);
    
    return percentageDistanceDone;
  }

  calculatePercentageDone(distance, legDistance, duration , legDuration) {
    let percentageDistanceDone = (legDistance - distance * 100) / legDistance;
    console.log(' MapComponent -> calculatePercentageDone -> percentageDistanceDone', percentageDistanceDone);
    
    let percentageDurationDone = (legDuration - duration  * 100) / legDuration;
    console.log(' MapComponent -> calculatePercentageDone -> percentageDurationDone', percentageDurationDone);
    let percentageDistanceAndDurationAverage = (percentageDistanceDone + percentageDurationDone) / 2;
    console.log(' MapComponent -> calculatePercentageDone -> percentageDistanceAndDurationAverage', percentageDistanceAndDurationAverage);
    return percentageDistanceAndDurationAverage;
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

