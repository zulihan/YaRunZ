import { Component, Input, ViewChild, TemplateRef, ViewContainerRef } from '@angular/core';
import { IonicPage, NavParams, ViewController } from 'ionic-angular';

/**
 * Generated class for the MapModalPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-map-modal',
  templateUrl: 'map-modal.html',
})
export class MapModalPage {

  @Input() inputTemplate: TemplateRef<any>;
  @ViewChild('mapElement', {read:ViewContainerRef}) mapElement : ViewContainerRef;

  template: TemplateRef<any>;
  taskLocationsModal: any;

  constructor(private navParams: NavParams, private view: ViewController) {
    this.template = this.navParams.get('template');
    // this.taskLocationsModal = this.navParams.get('locations');
    
  }

  ionViewWillLoad() {
    console.log('ionViewDidLoad MapModalPage');
    
    // console.log('this.inputTemplate: ', this.inputTemplate);
    // console.log('this mapcomponent: ', this.template.directionsDisplay);
    console.log('this.navParams: ', this.navParams);
    console.log('this template: ', this.template);

    // console.log('this.taskLocationsModal: ', this.taskLocationsModal);
    this.mapElement.createEmbeddedView(this.template);
  }

  closeModal() {
    this.view.dismiss();
  }

}
