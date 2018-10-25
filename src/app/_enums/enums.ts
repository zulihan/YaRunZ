export class Enums {    
}

export enum RunStatus {
    NOT_STARTED = 'has not started yet',
    STARTED = 'has started',
    ARRIVED_AT_DESTINATION = 'has arrived at destination',
    ON_THE_WAY_TO_SECOND_DESTINATION = 'is on the way to second destination',
    ARRIVED_AT_SECOND_DESTINATION = 'has arrived to second destination',
    ON_THE_WAY_BACK = 'is on the way back',
    COMPLETED = 'has completed'
}

export enum TaskStatus {
    SCHEDULED = 'scheduled',
    APPROACHING = 'approaching',
    DUE = 'due',
    LATE = 'late',
    OK = "ok",
    DONE = 'done'
}

export enum RunType {
    DROPOFF = 'drop off',
    PICKUP = 'pick-up',
    THREELEGS = 'three-legs'
}