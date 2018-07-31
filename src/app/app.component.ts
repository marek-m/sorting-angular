import {Component, OnInit} from '@angular/core';
import {Subject, timer} from 'rxjs/index';
import {concatMap, delay, filter, first, map, takeUntil, tap} from 'rxjs/internal/operators';

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
            filter((value) => {
                const [a, b] =  value;
                return a !== b;
            }),
            concatMap((value) => {
                this.steps++;
                this.animation = true;
                const [a, b] = value;
                console.log(a, b);
                this.currentIndexes = [a, b];
                return this.delayValueByTime(500, value).pipe(
                    tap(() => {
                        const tempLeft = this.positions[a];
                        this.positions[a] = this.positions[b];
                        this.positions[b] = tempLeft;
                    }),
                    delay(200)
                );
            })
        ).subscribe((value) => {
            this.animation = false;
            const [a, b, ...array] = value;
            this.bars = array;
            this.positions = [...this.positionsCopy];
        });

        // SORT
        this.bubbleSort([...this.bars]);
        //this.quickSort([...this.bars], 0, this.bars.length - 1);


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

    private quickSort(arr, left, right) {
        const len = arr.length;
        let pivot;
        let partitionIndex;


        if (left < right) {
            pivot = right;
            partitionIndex = this.partition(arr, pivot, left, right);

            // sort left and right
            this.quickSort(arr, left, partitionIndex - 1);
            this.quickSort(arr, partitionIndex + 1, right);
        }
        return arr;
    }

    private partition(arr, pivot, left, right) {
        const pivotValue = arr[pivot];
        let partitionIndex = left;

        for (let i = left; i < right; i++) {
            if (arr[i] < pivotValue) {
                this.swap$.next(this.swap(i, partitionIndex, arr));
                partitionIndex++;
            }
        }
        this.swap$.next(this.swap(right, partitionIndex, arr));
        return partitionIndex;
    }

    private mergeSort(arr) {
        const len = arr.length;
        if (len < 2) {
            return arr;
        }
        const mid = Math.floor(len / 2);
        const left = arr.slice(0, mid);
        const right = arr.slice(mid);
        // send left and right to the mergeSort to broke it down into pieces
        // then merge those
        return this.merge(this.mergeSort(left), this.mergeSort(right));
    }
    private merge(left, right) {
        const result = [];
        const lLen = left.length;
        const rLen = right.length;
        let l = 0;
        let r = 0;
        while ( l < lLen && r < rLen ) {
            if ( left[l] < right[r] ) {
                result.push(left[l++]);
            } else {
                result.push(right[r++]);
            }
        }
        // remaining part needs to be addred to the result
        return result.concat(left.slice(l)).concat(right.slice(r));
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
