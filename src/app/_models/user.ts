import { Roles } from './Roles';
import { Photo } from './photo';

export interface User {
    id: string;
    userName: string;
    email?: string;
    phoneNumber?: string;
    photoUrl?: string;
    role: Roles;
    photo?: Photo;
}
