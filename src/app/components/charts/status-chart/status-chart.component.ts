import { Component, ViewChild, OnInit, OnDestroy, Input, OnChanges } from "@angular/core";
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
  title: ApexTitleSubtitle;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-status-chart',
  templateUrl: './status-chart.component.html',
  styleUrls: ['./status-chart.component.css']
})
export class StatusChartComponent implements OnInit, OnChanges {
  @ViewChild("chart") chart!: ChartComponent;
  public chartOptions: Partial<ChartOptions>;

  @Input() statusData: number[] = []; // Array to receive data from parent
  @Input() chartTitle: string = 'Default Title'; // Title of the chart

  constructor() {
    this.chartOptions = {
      series: [],
      chart: {
        height: 350,
        type: "area",
        toolbar: {
          show: true
        },
        zoom: {
          enabled: false
        }
      },
      title: {
        text: this.chartTitle,
        align: 'left',
        style: {
          fontSize: '20px',
          fontWeight: 'bold'
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
          "2024-09-19T00:00:00.000Z",
          "2024-09-19T01:30:00.000Z",
          "2024-09-19T02:30:00.000Z",
          "2024-09-19T03:30:00.000Z",
          "2024-09-19T04:30:00.000Z",
          "2024-09-19T05:30:00.000Z",
          "2024-09-19T06:30:00.000Z"
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
              height: 300
            }
          }
        },
        {
          breakpoint: 600,
          options: {
            chart: {
              height: 250
            },
            xaxis: {
              labels: {
                show: false
              }
            }
          }
        }
      ]
    };
  }

  ngOnInit() {
    // Update chart options with initial data
    this.updateChart();
  }

  ngOnChanges(): void {
    // Handle changes to the input properties and update the chart
    this.updateChart();
  }

  private updateChart(): void {
    this.chartOptions.series = [
      {
        name: this.chartTitle,
        data: this.statusData // Use the latest statusData passed
      }
    ];
   
  }
}
