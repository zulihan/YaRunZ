import { Injectable } from '@angular/core';

import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import { Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { JwtHelperService } from '@auth0/angular-jwt';

import { User } from '../_models/user';
import { environment } from '../../environments/environment';
import { of } from 'rxjs/observable/of';
import { Runner } from '../_models/runner';


@Injectable()
export class AuthService {

  baseUrl = environment.apiUrl + 'auth/';
  tokenSubject = new Subject<boolean>();
  jwtHelper = new JwtHelperService();
  decodedToken: any;
  user: Observable<User | null>;
  loginErrorMessage: any;
  currentUser: Runner;
  photoUrl = new BehaviorSubject<string>('../../../assets/img/person.svg');
  currentPhotoUrl = this.photoUrl.asObservable();

  constructor(private jwtHelperService: JwtHelperService,
              private http: Http) {

  }

  changeUserPhoto(photoUrl: string) {
    this.photoUrl.next(photoUrl);
  }

  login(username, password) {
    const model = {
      username,
      password
    };
    console.log(JSON.parse(localStorage.getItem('user')));
    
    // return this.currentUser = JSON.parse(localStorage.getItem('user'));
    // return this.http.post(this.baseUrl + 'login', model)
    //   .pipe(
    //     map( (response: any) => {
    //       // const user = response;
    //       console.log('user from login response', response._body);
    //       if (response.status === 200) {
    //         const user = JSON.parse(response._body);
    //         console.log('user token: ',  user.token)
    //         localStorage.setItem('token', user.token);
    //         this.decodedToken = this.jwtHelper.decodeToken(user.token);
    //         console.log('this decoded token: ', this.decodedToken);
    //         localStorage.setItem('user', JSON.stringify(user.user));
    //         this.currentUser = JSON.parse(localStorage.getItem('user'));
    //         console.log('this.currentUser: ', this.currentUser);
    //         this.changeUserPhoto(user.user.photoUrl);
    //       }
    //     })
    //   )
    //   .catch(this.handleErrorObservable);
  }

  isLoggedIn(): Observable<boolean> {
    const token = this.jwtHelperService.tokenGetter();
    if (!token) {
      return of(false);
    }
    console.log('called isLoggedIn method in AuthService: ');
    return of(!this.jwtHelperService.isTokenExpired(token));
  }

  
  signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // If error, console log and notify user
  private handleErrorObservable (error: Response | any) {
    console.error(error.message || error );
    return Observable.throw(error.message || error);
  }
}
