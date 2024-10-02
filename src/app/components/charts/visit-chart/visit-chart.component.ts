import { Component, Input, OnChanges } from '@angular/core';
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
export class VisitChartComponent implements OnChanges {
  @Input() chartData: { year: number; month: number; count: number }[] = [];
  @Input() chartName: string = 'Market Visits Per Month'; // New Input for dynamic chart name
  public chartOptions: ChartOptions; // Use ChartOptions type

  constructor() {
    // Initialize chartOptions with a default value
    this.chartOptions = {
      series: [],
      chart: {
        type: 'line',
        height: 350,
        width: '100%', // Set width to 100% for responsiveness
        zoom: {
          enabled: false, // Disable zooming
        },
        toolbar: {
          tools: {
            zoom: false, // Disable zoom tool
            selection: false, // Disable selection tool
          },
        },
      },
      xaxis: {
        categories: [],
        title: {
          text: 'Date (Year-Month)',
        },
        labels: {
          show: true, // Ensure labels are shown
          rotate: -45, // Optionally rotate labels for better visibility
          hideOverlappingLabels: true, // Hide overlapping labels
        },
      },
      yaxis: {
        title: {
          text: 'Count',
        },
        min: 0,
      },
      title: {
        text: this.chartName, // Set dynamic chart name
        align: 'left',
      },
      tooltip: {},
      stroke: {
        curve: 'smooth',
      },
      grid: {
        show: false, // Hide the grid lines
      },
    };
  }

  ngOnChanges(): void {
    if (this.chartData.length > 0) {
      this.updateChartOptions();
    }
  }

  // Updated method to set up the chart options
  private updateChartOptions(): void {
    const categories: string[] = [];
    const seriesData: number[] = [];

    // Create a map for easy access to the counts by month
    const countMap: { [key: string]: number } = {};

    // Populate the map with existing data
    this.chartData.forEach((item) => {
      const monthKey = `${item.year}-${('0' + item.month).slice(-2)}`;
      countMap[monthKey] = item.count;
    });

    // Define the range of months you want to display
    const startYear = Math.min(...this.chartData.map((item) => item.year));
    const endYear = Math.max(...this.chartData.map((item) => item.year));

    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthKey = `${year}-${('0' + month).slice(-2)}`;
        categories.push(monthKey);
        // Set count to 0 if there is no data for that month
        seriesData.push(countMap[monthKey] || 0);
      }
    }

    this.chartOptions = {
      series: [
        {
          name: 'Market Visits',
          data: seriesData,
        },
      ],
      chart: {
        type: 'area',
        height: 350,
        width: '100%', // Ensure it takes full width
        zoom: {
          enabled: false, // Disable zooming
        },
        toolbar: {
          tools: {
            zoom: false, // Disable zoom tool
            selection: false, // Disable selection tool
          },
        },
      },
      xaxis: {
        categories: categories, // formatted 'Year-Month'
        labels: {
          show: true,
          rotate: -45, // Rotate for better fit
          hideOverlappingLabels: true, // Prevent overlap
        },
      },
      yaxis: {
        title: {
          text: 'Count',
        },
        min: 0,
        max: seriesData.length > 0 ? Math.max(...seriesData) + 10 : 10, // Ensure seriesData is not empty
      },
      title: {
        text: this.chartName, // Ensure title reflects the input property
        align: 'left',
      },
      tooltip: {},
      stroke: {
        curve: 'smooth',
      },
      grid: {
        show: false,
      },
    };
  }
}
