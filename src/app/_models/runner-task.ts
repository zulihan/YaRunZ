import { Runner } from './runner';
import { Place } from './place';

export interface RunnerTask {
    id?: any;
    closedAt?: any;
    createdAt: string;
    createdBy: string;
    isDone: boolean;
    runner: Runner;
    artist: any;
    pers: number;
    from: Place;
    to: Place;
    startAt?: any;
    startedAt?: any;
    startAtToString: string;
    updatedAt?: any;
    status: string;
    over: any;
    type: string;
    taskStatus: string;
    estimatedDuration: any;
    durationToTime?: string;
    distance: any;
    distanceToKm?: string;
}
