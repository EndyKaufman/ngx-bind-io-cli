import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'test-cmp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="isLoading">Loading... (5s)</div>
    <button (click)="onStart()">Start</button> <br />
    {{ propA }} <br />
    {{ propB }}
  `
})
export class HostTestInnerComponent {
  @Input()
  isLoading: boolean;
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

export class BaseHostTestComponent {
  isLoading$ = new BehaviorSubject(false);
  onStart() {
    this.isLoading$.next(true);
    setTimeout(() => this.isLoading$.next(false), 5000);
  }
}
@Component({
  selector: 'host-test-cmp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <test-cmp
      (start)="onStart()"
      [isLoading]="isLoading$ | async"
      [propA]="propA"
      [propB]="propB">
    </test-cmp>
    <hr />
    <test-cmp bindIO></test-cmp>
  `
})
export class HostTestComponent extends BaseHostTestComponent {
  propA = 'Prop A: defined';
  propB = 'Prop B: defined';
}
