import {Injectable} from "@angular/core";

@Injectable()
export class ConvertersService {

    
    constructor() {
        
    }

    secondsToHrsMinsSec(seconds: number) {        
        const date = new Date(null);
        date.setSeconds(seconds); // specify value for SECONDS here
        const result = date.toISOString().substr(11, 5);
        return result;
    }

}
