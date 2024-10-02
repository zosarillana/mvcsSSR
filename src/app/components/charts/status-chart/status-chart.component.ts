
import { Component, Input, ViewChild } from "@angular/core";
import {
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexChart,
  ChartComponent,
} from "ng-apexcharts";

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
};

@Component({
  selector: "app-status-chart",
  templateUrl: "./status-chart.component.html",
  styleUrls: ["./status-chart.component.css"],
})
export class StatusChartComponent {
  @ViewChild("chart") chart!: ChartComponent; // Use '!' to indicate it will be assigned later
  @Input() data: number[] = []; // Input property to receive data (should exclude user count)
  @Input() chartName: string = 'Default Title'; // Title of the chart
  public chartOptions: Partial<ChartOptions>;

  constructor() {
    this.chartOptions = {
      series: this.data, // Initialize series with received data
      chart: {
        width: 380,
        type: "pie",
      },
      labels: ["ISR Count", "Area Count", "Pod Count", "User Count"], // Update labels to exclude user count
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    };
  }

  ngOnChanges(): void {
    // Update chart data whenever input changes
    if (this.data.length > 0) {
      this.chartOptions.series = this.data; // Update series with new data
    }
  }
}