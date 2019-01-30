import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'basic-inner-cmp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="isLoading">Loading... (5s)</div>
    <button (click)="onStart()">Start</button> <br />
    {{ propA }} <br />
    {{ propB }}
  `
})
export class InnerComponent {
  @Input()
  isLoading: boolean = false;
  @Input()
  propA = 'Prop A: not defined';
  @Input()
  propB = 'Prop B: not defined';
  @Output()
  start = new EventEmitter();
  onStart() {
    this.start.next(true);
  }
}

export class BaseHostComponent {
  isLoading$ = new BehaviorSubject(false);
  onStart() {
    this.isLoading$.next(true);
    setTimeout(() => this.isLoading$.next(false), 5000);
  }
}
@Component({
  selector: 'basic-host-cmp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <basic-inner-cmp
      (start)="onStart()"
      [isLoading]="isLoading$ | async"
      [propA]="propA"
      [propB]="propB">
    </basic-inner-cmp>
    <hr />
    <basic-inner-cmp bindIO></basic-inner-cmp>
  `
})
export class HostComponent extends BaseHostComponent {
  propA = 'Prop A: defined';
  propB = 'Prop B: defined';
}
