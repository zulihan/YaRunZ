import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TabsPage } from '../tabs/tabs';
import { AuthService } from '../../app/_services/auth.service';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  username: string;
  password: string;

  constructor(public navCtrl: NavController, private authService: AuthService) {

  }

  login() {
    this.navCtrl.push(TabsPage);
    // this.authService.login(this.username, this.password)
    // .subscribe(
    //   response => {
    //     console.log('logged in', response);
    //     console.log('usename: ', this.username);
    //     console.log('password: ', this.password);
    //     this.navCtrl.push(TabsPage);
    //   },
    //   error => {
    //     console.log(error.message);   
    //   }
    // );        
  }

}