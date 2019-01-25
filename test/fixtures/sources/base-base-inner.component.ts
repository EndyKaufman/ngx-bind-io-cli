import { Input } from '@angular/core';

export class BaseBaseInnerComponent {
    @Input()
    isLoading: boolean;
    @Input()
    propA = 'Prop A: not defined';
    @Input()
    propB = 'Prop B: not defined';
}