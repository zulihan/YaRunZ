import { Injectable } from '@angular/core';
import { Firebase } from '@ionic-native/firebase';
import { Platform } from 'ionic-angular';
import { AngularFirestore } from 'angularfire2/firestore';


@Injectable()
export class FcmProvider {
  currentUser;
  currentUserId;

  constructor(
    public firebaseNative: Firebase,
    public afs: AngularFirestore,
    private platform: Platform) {
    this.currentUser = JSON.parse(localStorage.getItem('user'));
    console.log(' FcmProvider -> this.currentUser', this.currentUser);
    // this.currentUserId = this.currentUser.id;
    this.currentUserId = 6;
    console.log(' FcmProvider -> this.currentUser', this.currentUserId);
  }

  // Get permission from the user
  async getToken() { 
    let token;

    if (this.platform.is('android')) {
      token = await this.firebaseNative.getToken();
    } 

    if (this.platform.is('ios')) {
      token = await this.firebaseNative.getToken();
      await this.firebaseNative.grantPermission();
    } 
    
    return this.saveTokenToFirestore(token);
  }

  // Save the token to firestore
  private saveTokenToFirestore(token) {
    if (!token) return;

    const devicesRef = this.afs.collection('devices');

    const docData = { 
      token,
      userId: this.currentUserId,
    };

    return devicesRef.doc(token).set(docData);
  }

  // Listen to incoming FCM messages
  listenToNotifications() {
    return this.firebaseNative.onNotificationOpen();
  }

}