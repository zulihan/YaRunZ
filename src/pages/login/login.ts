import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { AuthService } from '../../app/_services/auth.service';
import { GeoService } from '../../app/_services/geo.service';
import { LoadingController } from 'ionic-angular';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  username: string;
  password: string;

  constructor(
    public navCtrl: NavController,
    public loadingController: LoadingController,
    private authService: AuthService,
    private geoService: GeoService) {}

  login() {
        
    // this.authService.login(this.username, this.password)
    // .subscribe(
    //   response => {
        // console.log(' LoginPage -> login -> response', response);
    //     console.log(' LoginPage -> login -> this.username', this.username);
    //     console.log(' LoginPage -> login -> this.password', this.password);
    //     this.navCtrl.push(TabsPage);
    //   },
    //   error => {
    //     console.log(' LoginPage -> login -> error.message', error.message);
    //   }
    // );     
    // this.geoService.getPosition();
    this.loadApp(); 
  }

  loadApp() {
    let loader = this.loadingController.create({
      spinner: 'bubbles',
      content: 'fetching data',
      duration: 3000
    });
    loader.present().then( ()=> {
      this.navCtrl.push(TabsPage);
    });    
  }
}