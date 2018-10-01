import * as firebase from 'firebase';

export interface Place {
    id?: number;
    name: string;
    address?: string;
    coord?: firebase.firestore.GeoPoint;
    latitude?: number;
    longitude?: number;
    type?: string;
    place_id?: string;
}
