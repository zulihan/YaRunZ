import { Geoposition } from "@ionic-native/geolocation";

export interface RunnerTracking {
    uid: number;
    userName: string;
    position: Geoposition;
    available: boolean;
}
