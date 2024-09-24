import { Component, ViewChild } from "@angular/core";
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTooltip,
  ApexStroke,
  ApexTitleSubtitle,
  ApexResponsive
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle; // Added for the title
  responsive: ApexResponsive[]; // Added for responsive behavior
};

@Component({
  selector: 'app-status-chart',
  templateUrl: './status-chart.component.html',
  styleUrls: ['./status-chart.component.css']
})
export class StatusChartComponent {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: [
        {
          name: "Series 1",
          data: [31, 40, 28, 51, 42, 109, 100]
        },
        {
          name: "Series 2",
          data: [11, 32, 45, 32, 34, 52, 41]
        }
      ],
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: true
        },
        zoom: {
          enabled: false // Disable zoom to avoid passive event issues
        }
      },
      title: {
        text: "Markets", // Chart title added
        align: 'left', // Title alignment
        style: {
          fontSize: '20px', // Customize title font size
          fontWeight: 'bold' // Customize title font weight
        }
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth"
      },
      xaxis: {
        type: "datetime",
        categories: [
          "2018-09-19T00:00:00.000Z",
          "2018-09-19T01:30:00.000Z",
          "2018-09-19T02:30:00.000Z",
          "2018-09-19T03:30:00.000Z",
          "2018-09-19T04:30:00.000Z",
          "2018-09-19T05:30:00.000Z",
          "2018-09-19T06:30:00.000Z"
        ]
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      },
      responsive: [
        {
          breakpoint: 1000,
          options: {
            chart: {
              height: 300 // Height adjustment for screens smaller than 1000px
            }
          }
        },
        {
          breakpoint: 600,
          options: {
            chart: {
              height: 250 // Height adjustment for screens smaller than 600px
            },
            xaxis: {
              labels: {
                show: false // Hide labels on very small screens
              }
            }
          }
        }
      ]
    };
  }
}
