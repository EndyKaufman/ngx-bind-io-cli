import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { BaseBaseHostComponent } from './base-base-host.component';
import { BaseBaseInnerComponent } from './base-base-inner.component';

export class BaseBaseBaseInnerComponent extends BaseBaseInnerComponent {
  @Output()
  start = new EventEmitter();
  onStart() {
    this.start.next(true);
  }
}
@Component({
  selector: 'inherits-inner-cmp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div *ngIf="isLoading">Loading... (5s)</div>
    <button (click)="onStart()">Start</button> <br />
    {{ propA }} <br />
    {{ propB }}
  `
})
export class InnerComponent extends BaseBaseBaseInnerComponent { }


export class BaseBaseBaseHostComponent extends BaseBaseHostComponent {
  onStart() {
    this.isLoading$.next(true);
    setTimeout(() => this.isLoading$.next(false), 5000);
  }
}
@Component({
  selector: 'inherits-host-cmp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <inherits-inner-cmp
      (start)="onStart()"
      [isLoading]="isLoading$ | async"
      [propA]="propA"
      [propB]="propB"
    >
    </inherits-inner-cmp>
    <hr />
    <inherits-inner-cmp bindIO> </inherits-inner-cmp>
  `
})
export class HostComponent extends BaseBaseBaseHostComponent {
  propA = 'Prop A: defined';
}
