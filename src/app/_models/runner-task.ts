import { Runner } from './runner';
import { Place } from './place';

export interface RunnerTask {
    id?: any;
    closedAt?: string;
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
    updatedAt?: string;
    status: string;
    over: any;
    type: string;
    taskStatus: string;
    estimatedDuration: any;
    durationToTime?: string;
    distance: any;
    distanceToKm?: string;
}
