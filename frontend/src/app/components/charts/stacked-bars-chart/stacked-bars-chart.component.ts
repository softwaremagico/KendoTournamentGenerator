import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ChartComponent
} from "ng-apexcharts";
import {Colors} from "../colors";
import {Data, StackedBarChartData} from "./stacked-bars-chart-data";


export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  labels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-stacked-bars-chart',
  templateUrl: './stacked-bars-chart.component.html',
  styleUrls: ['./stacked-bars-chart.component.scss']
})
export class StackedBarsChartComponent implements OnInit {

  @ViewChild('chart') chart: ChartComponent;
  public chartOptions: ChartOptions;

  @Input()
  public data: StackedBarChartData;
  @Input()
  public width: number = 500;
  @Input()
  public showToolbar: boolean = true;
  @Input()
  public colors: string[] = Colors.defaultPalette;
  @Input()
  public horizontal: boolean = false;
  @Input()
  public barThicknessPercentage: number = 75;
  @Input()
  public showValuesLabels: boolean = true;
  @Input()
  public xAxisOnTop: boolean = false;
  @Input()
  public xAxisTitle: string | undefined = undefined;
  @Input()
  public yAxisTitle: string | undefined = undefined;
  @Input()
  public showYAxis: boolean = true;
  @Input()
  public title: string | undefined = undefined;
  @Input()
  public titleAlignment: "left" | "center" | "right" = "center";

  ngOnInit() {
    this.chartOptions = {
      chart: {
        width: this.width,
        type: "bar",
        toolbar: {
          show: this.showToolbar,
        },
        stacked: true,
      },
      series: this.setColors(this.data.getData()),
      labels: {
        enabled: this.showValuesLabels
      },
      plotOptions: {
        bar: {
          distributed: false, // this line is mandatory for using colors
          horizontal: this.horizontal,
          barHeight: this.barThicknessPercentage + '%',
          columnWidth: this.barThicknessPercentage + '%',
        }
      },
      xaxis: {
        categories: this.data.getLabels(),
        position: this.xAxisOnTop ? 'top' : 'bottom',
        title: {
          text: this.xAxisTitle
        }
      },
      yaxis: {
        show: this.showYAxis,
        title: {
          text: this.yAxisTitle
        },
      },
      title: {
        text: this.title,
        align: this.titleAlignment
      },
    };
  }

  setColors(data: Data[]): Data[] {
    for (let i = 0; i < data.length; i++) {
      data[i].color = this.colors[i % this.colors.length];
    }
    return data;
  }
}
