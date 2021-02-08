import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'j-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  @Input() summary: any;
  @Input() log: object[];
  chartData: object;
    chartConfig = {
        legend: {display: false},
        maintainAspectRatio: false,
        title: {display: false},
        tooltips: {
            callbacks: {
                label: (tt) => '$' + parseInt(tt.value).toLocaleString()
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: (v) => '$' + v.toLocaleString()
                }
            }]
        }
    };

  constructor() { }

  ngOnInit(): void {
      this.chartData = this.makeChartData();
  }

  makeChartData (): object {
      const scores = [{name: 'You', coryat: this.summary.score['Jeopardy'] + this.summary.score['Double Jeopardy']}];
      for (const name in this.summary.coryats) {
          scores.push({name: name[0].toLocaleUpperCase() + name.slice(1), coryat: this.summary.coryats[name]});
      }
      scores.sort((a, b) => {
          return b.coryat - a.coryat;
      });
      const data = {labels: [], datasets: [{backgroundColor: [], data: []}]};
      for (const player of scores) {
          data.labels.push(player.name);
          data.datasets[0].data.push(player.coryat);
          if (player.name === 'You') {
              data.datasets[0].backgroundColor.push('#40d41c');
          } else if (player.name === 'Combined') {
              data.datasets[0].backgroundColor.push('#f78f39');
          } else {
              data.datasets[0].backgroundColor.push('#4287f5');
          }
      }
      console.log(data);
      return data;
  }

}
