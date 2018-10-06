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
  Input
} from '@angular/core';
import { IonicPage, NavController, NavParams, Platform } from 'ionic-angular';
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
  LatLng
} from '@ionic-native/google-maps';
import { GeoService } from '../../app/_services/geo.service';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html'  
})

export class MapComponent implements OnInit {

  @ViewChild('map_canvas') map_canvas: ElementRef;

  @Input('mapConfig') mapConfig;

  @Input('taskLocations') taskLocations;
    
  locations = [];

  runnerPosition;
  runnerLocationLat;
  runnerLocationLng;
  runnerMapPosition;
  
  map: GoogleMap;
  mapOptions: GoogleMapOptions = {
    camera: {
       target: {
         lat: 43.270584762037416,
         lng: 5.39729277752383
       },
       zoom: 14,
       tilt: 30
     },
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
  
  
  ggmKey = env.googleMapsKey;
  ggmKeyDebug = env.googleMapsKey;
  

  constructor(
      public navCtrl: NavController,
      public navParams: NavParams,
      private geolocation: Geolocation,
      private geoService: GeoService,
      private platform: Platform,
      )
       {
        this.geoService.runnerPosObs.subscribe( pos => {
          this.runnerPosition = pos;
          this.runnerLocationLat = pos.coords.latitude;
        this.runnerLocationLng = pos.coords.longitude;
        });     
        
      }

  ngOnInit() {      
    console.log('ngOninit: ');       
    console.log('mapConfig: ', this.mapConfig); 
    console.log('taskLocations: ', this.taskLocations);     
    this.platform.ready().then( () => {
      this.initMap();
      this.createMarkers();      
    }) 
  }

  ionViewDidLoad() {    
    console.log('ionViewDidLoad MapPage');    
  }

  ngAfterViewInit() {    
    console.log('ngAfterViewInit() this.runnerPosition: ', this.runnerPosition);    
  }

  doRefresh(state) {
    console.log('$event: ', event);   

    this.createMarkers();

    console.log("refreshed ! ");
  }

  initMap() {  
    let element = this.map_canvas.nativeElement;
    console.log('GoogleMapsEvent.MAP_READY this.runnerPosition: ', this.runnerPosition);
    this.runnerMapPosition = new LatLng(this.runnerLocationLat, this.runnerLocationLng);
    this.map = GoogleMaps.create(element, this.mapOptions);              
  }

  createMarkers(){
    this.map.one(GoogleMapsEvent.MAP_READY).then(
      () => {                 
        console.log('this locations: ', this.locations);
        this.getMarkers();
        setTimeout( () => { 
          let marsLoc = new LatLng(this.locations[0].coord.latitude, this.locations[0].coord.longitude);         
          this.moveCamera(marsLoc, 12, 30);            
        }, 2000);
        setTimeout( () => {
          let loc =           
          this.moveCamera(this.runnerMapPosition, 15, 30);            
        }, 4000);          
      }
    ).catch(err => console.log(err));
  }

  moveCamera(loc: LatLng, zoom, tilt) {
    let options: CameraPosition<any> = {
      target: loc,
      zoom,
      tilt
    }
    this.map.moveCamera(options);
  }

  getMarkers() {
    if ( this.mapConfig === 'map-page') {
      this.geoService.getLocations().subscribe( locs => {
        this.locations = locs;      
        this.addMarkersToMap(this.locations);  
      })
    } else {
      this.addMarkersToMap(this.taskLocations);
    }
        
  }

  addMarkersToMap(locations) {
    let marker: Marker = this.map.addMarkerSync({
      title: 'Zu position',
      icon: 'assets/icons/m1.png',
      animation: GoogleMapsAnimation.BOUNCE,
      position: {
        lat: this.runnerLocationLat,
        lng: this.runnerLocationLng
      }
    });
    marker.showInfoWindow();
    marker.on(GoogleMapsEvent.MARKER_CLICK).subscribe((marker) => {
      console.log('click event on marker:', marker)
      alert('Your Position: latitude: ' + this.runnerLocationLat + ' longitude: ' + this.runnerLocationLng ); 
    });
    
    for (let location of locations) {
      let position = new LatLng(location.coord.latitude, location.coord.longitude);
      this.map.addMarkerSync({
        position, 
        title: location.name,
        icon: {
          url: location['name'] !== 'Marsatac' ? 'red' : 'assets/icons/m2018.png'
        }        
      }); 
    }     
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
  
}  

