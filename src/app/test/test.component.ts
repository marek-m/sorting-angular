import {Component, ElementRef, OnInit} from '@angular/core';
import {interval, Observable} from 'rxjs/index';
import {concatMap, first} from 'rxjs/internal/operators';

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.sass']
})
export class TestComponent implements OnInit {

    public positions = [
        {top: '0%', left: '0%'},
        {top: '90%', left: '0%'}
    ];
    public ngOnInit(): void {
        interval(3000).pipe(
            concatMap(() =>
                interval(1000).pipe(first())
            )
        ).subscribe(() => this.swap());
    }

    public getStyle(el: number) {
        return {
            'top': this.positions[el].top,
            'left': this.positions[el].left
        };
    }

    private swap() {
        const [a, b] = this.positions;
        this.positions = [b, a];
    }
}
