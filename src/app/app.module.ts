import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Geolocation } from '@ionic-native/geolocation';
import  { IonicStorageModule} from '@ionic/storage';
import { GoogleMaps, GoogleMap } from '@ionic-native/google-maps';

import { HTTP } from '@ionic-native/http';

import {ProgressBarModule} from "angular-progress-bar"

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { environment } from '../environments/environment';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ContactPage } from '../pages/contact/contact';
import { MapPage } from '../pages/map/map';
import { MapModalPage } from '../pages/map-modal/map-modal';
import { LoginPage } from '../pages/login/login';
import { TabsPage } from '../pages/tabs/tabs';
import { TaskDetailPage } from '../pages/task-detail/task-detail';


import { AuthService } from './_services/auth.service';
import { TasksService } from './_services/tasks.service';

import { JwtModule } from '@auth0/angular-jwt';
import { GeoService } from './_services/geo.service';
import { RunzService } from './_services/runz.service';
import { RunnerService } from './_services/runner.service';
import { MapComponent } from './map/map.component';

@NgModule({
   declarations: [
      MyApp,
      HomePage,
      MapPage,
      MapModalPage,
      ContactPage,
      LoginPage,
      TabsPage,
      TaskDetailPage,
      MapComponent
   ],
   imports: [
      BrowserModule,
      HttpModule,
      HttpClientModule,
      IonicModule.forRoot(MyApp),
      JwtModule.forRoot({
        config: {
          tokenGetter: () => {
            return localStorage.getItem('token');
          },
          whitelistedDomains: ['localhost:5000'],
          blacklistedRoutes: ['localhost:5000/api/auth']
        }  
      }), 

    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    BrowserAnimationsModule,
    MatProgressBarModule,
    IonicStorageModule,
    ProgressBarModule,
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    MapPage,
    MapModalPage,
    ContactPage,
    LoginPage,
    TabsPage,
    TaskDetailPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    AuthService,
    Geolocation,
    GeoService,
    GoogleMaps,
    RunzService,
    TasksService,
    RunnerService,
    HTTP,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ],
  schemas: [ NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA ],
  exports: [
    MapComponent
  ]
})
export class AppModule {}
