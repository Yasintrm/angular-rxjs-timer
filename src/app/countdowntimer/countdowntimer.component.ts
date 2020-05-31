import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { TimerService, TimerState } from '../services/timer.service';
import { Observable, BehaviorSubject, empty, of, timer, combineLatest, forkJoin } from 'rxjs';
import { switchMap, flatMap, map, scan, startWith, takeWhile, distinct, distinctUntilChanged, tap } from 'rxjs/operators';

// export class TimerViewModel {
//   currentValue: number;
//   startDate: Date;
//   currentDate: Date;
//   state: TimerState
// }

@Component({
  selector: 'app-countdowntimer',
  templateUrl: './countdowntimer.component.html',
  styleUrls: ['./countdowntimer.component.css'],
  providers: [{ provide: TimerService }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountdowntimerComponent implements OnInit {
  time: String = "Angular Timer";
  // timer$: Observable<TimerViewModel>;
  timerButton$ = new BehaviorSubject<TimerState>(TimerState.stop);
  vm$: Observable<{ timerState: TimerState; value: number; }>;
  

  constructor(private timerService: TimerService) {
  }

  ngOnInit(): void {
    this.vm$ = this.timerService.getNewTimer({
      source$: this.timerButton$,
      endValue: 0,
      interval: 33,
      startValue: 10,
      precision: 2,
      onTick: (val: number) => {
        //console.log(val, new Date());
      },
      onFinish: () => {
        console.log("finished");
      }
    });
  }

  pause() {
    this.timerButton$.next(TimerState.pause);
  }

  stop() {
    this.timerButton$.next(TimerState.stop);
  }

  start() {
    this.timerButton$.next(TimerState.run);
  }

}
