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
  state
} from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';


/**
 * Generated class for the MapPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-map',
  templateUrl: 'map.html',
  animations: [
    trigger('rotation', [
        state('normal', style({
          transform: 'rotate(0)'
        })),
        state('rotated', style({
          transform: 'rotate(360deg)',
        })),
        transition('normal => rotated', animate('800ms cubic-bezier(0.6, -0.28, 0.735, 0.045)')),       
        transition('rotated => *', animate('900ms cubic-bezier(0.175, 0.885, 0.32, 1.275)')),       
      ]
    )
  ]  
})

export class MapPage implements OnInit, AfterViewInit {
  
  state = 'normal';
  mapConfig = 'map-page';

  constructor(
      public navCtrl: NavController,
      public navParams: NavParams){}

  ngOnInit() {
  }

  ionViewDidLoad() {    
    console.log('ionViewDidLoad MapPage');    
  }

  ngAfterViewInit() {}  

  doRefresh(state) {
    state === 'normal' ? this.state = 'rotated' : this.state = 'normal';
    setTimeout( () => this.state = 'normal', 1000);
    console.log('this.state: ', this.state);
  }

}
