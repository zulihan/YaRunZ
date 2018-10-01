export interface Task {
    id?: any;
    closedAt?: number;
    createdAt: number;
    createdBy: string;
    isDone: boolean;
    todo: string;
    dueAt?: number;
    timeLeft?: number;
    updatedAt: number;
}
