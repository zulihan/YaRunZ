import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { MapPage } from './map';
import { MapComponent } from '../../app/map/map.component';

@NgModule({
  declarations: [
    MapPage,
    MapComponent
  ],
  imports: [
    IonicPageModule.forChild(MapPage),
    MapComponent
  ],
})
export class MapPageModule {}
