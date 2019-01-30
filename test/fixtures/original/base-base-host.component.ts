import { BehaviorSubject } from 'rxjs';

export class BaseBaseHostComponent {
    isLoading$ = new BehaviorSubject(false);
    propB = 'Prop B: defined';
}