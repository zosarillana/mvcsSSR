import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  ApexChart,
  ApexAxisChartSeries,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexStroke,
  ApexGrid,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  grid: ApexGrid;
};

@Component({
  selector: 'app-visit-chart',
  templateUrl: './visit-chart.component.html',
  styleUrls: ['./visit-chart.component.css'],
})
export class VisitChartComponent {
  public chartOptions: Partial<ChartOptions>;
  // Input properties to receive counts from the parent component
  @Input() userCount: number = 0;
  @Input() isrCount: number = 0;
  @Input() areaCount: number = 0;
  @Input() visitCount: number = 0;
  @Input() chartName: string = 'Count';
  @Input() dateCreated: string[] = [];
  constructor(private datePipe: DatePipe) {
    this.chartOptions = {
      series: [
        {
          name: this.chartName,
          data: [10, 20, 15, 25, 30, 45, 50], // Sample data
        },
      ],
      chart: {
        height: 150,
        type: 'line',
        zoom: {
          enabled: false,
        },
        background: 'transparent', // Set the background to transparent
      },
      title: {
        text: 'Area',
        align: 'left',
        style: {
          fontSize: '10px', // Set the font size
          
          color: '#333', // Set the font color
        },
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], // X-axis labels
        labels: {
          show: true, // Hide the x-axis labels
        },
        axisBorder: {
          show: false, // Hide the x-axis border line
        },
        axisTicks: {
          show: false, // Hide the x-axis ticks
        },
        title: {
          text: '', // Remove the x-axis title
        },
      },
      yaxis: {
        title: {},
      },
      tooltip: {
        enabled: true,
      },
      stroke: {
        curve: 'smooth', // Smooth line curve
      },
      grid: {
        show: false, // Hide the grid lines
      },
    };
  }
  ngOnChanges(): void {
    // Convert date strings to short date format
    const shortDates = this.dateCreated.map(date => this.datePipe.transform(date, 'shortDate'));

    console.log('Short Dates:', shortDates); // Debugging line
    this.chartOptions.series = [
      {
        name: this.chartName,
        data: [this.userCount, this.isrCount, this.areaCount, this.visitCount, this.userCount],
      }
    ];
    
    // You may also want to set the x-axis categories to short dates
    this.chartOptions.xaxis = {
      categories: shortDates // Use the converted dates here
    };
  }
}
