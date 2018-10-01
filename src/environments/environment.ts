// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000/api/',
  nodeApiUrl: 'http://localhost:4201/api/',
  firebaseConfig: {
    apiKey: 'AIzaSyCTUO8mVPiYvT9lcxA_GRGI5GipYke4oLw',
    authDomain: 'festivalgeotracker.firebaseapp.com',
    databaseURL: 'https://festivalgeotracker.firebaseio.com',
    projectId: 'festivalgeotracker',
    storageBucket: 'festivalgeotracker.appspot.com',
    messagingSenderId: '1058082994374'
  },
  // googleMapsKey: 'AIzaSyAjUVpulfQoIt0LHVGcO9KLzitRXwbZVfs'
  googleMapsKey: 'AIzaSyCTUO8mVPiYvT9lcxA_GRGI5GipYke4oLw'
};

// apiKey: 'AIzaSyAwkFHZ4qZUoBSAVCz6SJCtldRfDmd20vE',

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
