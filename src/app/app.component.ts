import {Component, OnInit} from '@angular/core';
import {Subject, timer} from 'rxjs/index';
import {concatMap, first, map, takeUntil} from 'rxjs/internal/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
    public bars: number[] = [];
    public swap$: Subject<any> = new Subject<any>();
    public end$: Subject<boolean> = new Subject<boolean>();
    ngOnInit() {
        // GENERATE RANDOM ELEMENTS
        for (let i = 0; i < 40; i++) {
            const element = Math.ceil(Math.random() * 100);
            this.bars.push(element);
        }

        // ANIMATION (SORT OF...)
        this.swap$.pipe(
            takeUntil(this.end$),
            concatMap((value) => this.delayValueByTime(500, value))
        ).subscribe((v) => this.bars = v);

        // EXECUTE BUBBLE SORT
        this.bubbleSort([...this.bars]);


    }

    private bubbleSort(a) {
        let swapped;
        do {
            swapped = false;
            for (let i = 0; i < a.length - 1; i++) {
                if (a[i] > a[i + 1]) {
                    this.swap$.next(this.swap(i, i + 1, a));
                    swapped = true;
                }
            }
        } while (swapped);
        this.end$.next(true);
    }

    private swap(a, b, array) {
        const temp =  array[a];
        array[a] = array[b];
        array[b] = temp;
        return [...array];
    }

    public delayValueByTime = (time, value) => {
        return timer(time).pipe(
            first(),
            map(() => value)
        );
    }
}
