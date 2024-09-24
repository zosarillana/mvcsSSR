import { Component } from '@angular/core';
import { ChartComponent } from 'ng-apexcharts';
import {
  ApexChart,
  ApexAxisChartSeries,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ApexTooltip,
  ApexStroke,
  ApexGrid
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
  styleUrls: ['./visit-chart.component.css']
})
export class VisitChartComponent {
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: 'Count',
          data: [10, 20, 15, 25, 30, 45, 50] // Sample data
        }
      ],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false
        },
        background: 'transparent' // Set the background to transparent
      },
      title: {
        text: 'Data Count Over Time',
        align: 'left'
      },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'], // X-axis labels
        labels: {
          show: false // Hide the x-axis labels
        },
        axisBorder: {
          show: false // Hide the x-axis border line
        },
        axisTicks: {
          show: false // Hide the x-axis ticks
        },
        title: {
          text: '' // Remove the x-axis title
        }
      },
      yaxis: {
        title: {          
        }
      },
      tooltip: {
        enabled: true
      },
      stroke: {
        curve: 'smooth' // Smooth line curve
      },
      grid: {
        show: false // Hide the grid lines
      }
    };
  }
}