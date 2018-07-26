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
    public positions: number[] = [];
    public positionsCopy: number[] = [];
    public swap$: Subject<any> = new Subject<any>();
    public end$: Subject<boolean> = new Subject<boolean>();
    public currentIndexes: number[] = [];
    public SWAP_ANIMATION_TIME_MS = 500;
    public NUMBER_OF_ELEMENTS = 20;
    public animation = false;
    public steps = 0;
    public containerSizeParams = {
        width: 600,
        height: 400,
    };
    public ngOnInit() {
        // GENERATE RANDOM ELEMENTS
        for (let i = 0; i < this.NUMBER_OF_ELEMENTS; i++) {
            const height: number = Math.ceil(Math.random() * this.containerSizeParams.height);
            this.positions.push(
                this.containerSizeParams.width / this.NUMBER_OF_ELEMENTS * i
            );
            this.positionsCopy = [...this.positions];

            this.bars.push(height);
        }

        // ANIMATION (SORT OF...)
        this.swap$.pipe(
            takeUntil(this.end$),
            concatMap((value) => {
                this.steps++;
                this.animation = true;
                const [a, b] = value;
                this.currentIndexes = [a, b];
                const tempLeft = this.positions[a];
                this.positions[a] = this.positions[b];
                this.positions[b] = tempLeft;
                return this.delayValueByTime(this.SWAP_ANIMATION_TIME_MS, value);
            })
        ).subscribe((value) => {
            this.animation = false;
            const [a, b, ...array] = value;
            this.bars = array;
            this.positions = [...this.positionsCopy];
        });

        // SORT
        this.bubbleSort([...this.bars]);


    }
    public getBarStyle(index: number) {
        return {
            'left': this.animation ? `${this.positions[index]}px` : `${this.positionsCopy[index]}px`,
            'height': `${this.bars[index]}px`,
            'width': `${(this.containerSizeParams.width / this.NUMBER_OF_ELEMENTS) - 4}px`,
        };
    }

    public getBarClass(i) {
        return {
            'bar': true,
            'animate': this.animation ? this.currentIndexes.includes(i) : false
        };
    }

    public get containerStyle() {
        return {
            'width': `${this.containerSizeParams.width}px`,
            'height': `${this.containerSizeParams.height}px`
        };
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
        return [a, b, ...array];
    }

    public delayValueByTime = (time, value) => {
        return timer(time).pipe(
            first(),
            map(() => value)
        );
    }
}
