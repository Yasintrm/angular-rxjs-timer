import { Injectable } from '@angular/core';
import { interval, timer, Observable, of, BehaviorSubject, TimeInterval } from 'rxjs';
import { map, scan, takeWhile, distinctUntilChanged, switchMap, tap, startWith } from 'rxjs/operators';

export enum TimerState {
  run,
  pause,
  stop,
  finish
}

export interface TimerBag {
  value: number;
  timerState: TimerState
}

export interface TimerOptions {
  source$: BehaviorSubject<TimerState>;
  startValue: number;
  endValue: number;
  interval: number;
  precision: number;
  onTick?: (value: number) => void;
  onFinish?: () => void;
}

export class TimerViewModel {
  value: number;
  startDate: Date;
  currentDate: Date;
  state: TimerState
}

@Injectable({
  providedIn: 'root'
})
export class TimerService {

  constructor() { }

  getNewTimer(options: TimerOptions) {
    const incrementPrefix = options.endValue > options.startValue ? 1 : - 1;

    const finishTimer = (): TimerViewModel => {

      const currentVal: TimerViewModel = {
        currentDate: new Date(),
        startDate: new Date(),
        value: 0,
        state: TimerState.finish
      };

      if (typeof options.onFinish === "function") {
        setTimeout(() => options.onFinish(), 0);
      }

      return currentVal;
    };

    const stopTimer = (): TimerViewModel => {
      return {
        currentDate: new Date(),
        startDate: new Date(),
        value: options.startValue,
        state: TimerState.stop
      };
    };

    const pauseTimer = (previousState: TimerViewModel): TimerViewModel => {
      const currentDate = new Date();
      const delta = (currentDate.valueOf() - previousState.startDate.valueOf()) / 1000;
      const newVal = options.startValue + incrementPrefix * parseFloat(delta.toFixed(options.precision));
      console.log("pause");
      return {
        currentDate: currentDate,
        startDate: previousState.startDate,
        value: newVal,
        state: TimerState.pause
      };
    };

    const runTimer = (previousState: TimerViewModel): TimerViewModel => {
      const currentDate = new Date();
      let currentState = { ...previousState, state: TimerState.run };

      if (previousState.state === TimerState.pause) {
        currentState.startDate = new Date(previousState.startDate.valueOf() + currentDate.valueOf() - previousState.currentDate.valueOf());
      }
      else if (previousState.state === TimerState.stop ||
        previousState.state === TimerState.finish) {
        currentState.startDate = new Date();
      }

      let delta = (currentDate.valueOf() - currentState.startDate.valueOf()) / 1000;


      let newVal = options.startValue + incrementPrefix * parseFloat(delta.toFixed(options.precision));

      if (options.endValue > options.startValue && newVal > options.endValue) {
        newVal = options.endValue;
      } else if (options.endValue < options.startValue && newVal < options.endValue) {
        newVal = options.endValue;
      }
      
      currentState.value = newVal;
      currentState.state = TimerState.run;
      //ok
      if (typeof options.onTick === "function") {
        setTimeout(() => options.onTick(currentState.value), 0);
      }

      return currentState;
    };

    return options.source$.pipe(
      distinctUntilChanged(),
      switchMap((value: TimerState, index: number) => {
        if (value === TimerState.run) {
          if (typeof options.onTick === "function") {
            setTimeout(() => options.onTick(options.startValue), 0);
          }
          return timer(0, options.interval)
            .pipe(
              map(() => value)
            );
        }

        return of(value);
      }),
      scan((previousState: TimerViewModel, runningState: TimerState): TimerViewModel => {

        switch (runningState) {
          case TimerState.finish: {
            return finishTimer();
          }
          case TimerState.stop: {
            return stopTimer();
          }
          case TimerState.pause: {
            return pauseTimer(previousState);
          }
          case TimerState.run: {
            return runTimer(previousState);
          }
          default:
            return previousState;
        }

      }, {
        state: options.source$.value,
        startDate: new Date(),
        currentDate: new Date(),
        value: options.startValue
      }),
      tap(state => {
        if (state.value === options.endValue) {
          options.source$.next(TimerState.finish);
        }
      }),
      map(state => {
        const val: TimerBag = { timerState: state.state, value: parseFloat(state.value.toFixed(options.precision)) };
        return val;
      })
    )
  }
}
