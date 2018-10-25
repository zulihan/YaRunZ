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
    console.log(' MapPage -> ionViewDidLoad -> ionViewDidLoad');
  }

  ngAfterViewInit() {}  

  doRefresh(state) {
    state === 'normal' ? this.state = 'rotated' : this.state = 'normal';
    setTimeout( () => this.state = 'normal', 1000);
    console.log(' MapPage -> doRefresh -> this.state', this.state);
  }

}
