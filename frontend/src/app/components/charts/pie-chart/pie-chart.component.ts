import {Component, Input, OnInit, ViewChild} from '@angular/core';

import {
  ApexChart,
  ApexFill,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexTitleSubtitle,
  ChartComponent
} from "ng-apexcharts";
import {PieChartData} from "./pie-chart-data";
import {Colors} from "../colors";


export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  colors: string [];
  chart: ApexChart;
  fill:ApexFill;
  responsive: ApexResponsive[];
  labels: string[];
  title: ApexTitleSubtitle;
};

@Component({
  selector: 'app-pie-chart',
  templateUrl: './pie-chart.component.html',
  styleUrls: ['./pie-chart.component.scss']
})
export class PieChartComponent implements OnInit {

  @ViewChild('chart')
  private chart: ChartComponent;
  public chartOptions: ChartOptions;

  @Input()
  public data: PieChartData;
  @Input()
  public width: number = 500;
  @Input()
  public colors: string[] = Colors.defaultPalette;
  @Input()
  public title: string | undefined = undefined;
  @Input()
  public titleAlignment: "left" | "center" | "right" = "center";
  @Input()
  public isDonut: boolean = false;
  @Input()
  public fill:  "gradient" | "solid" | "pattern" | "image" = "solid";

  ngOnInit() {
    this.chartOptions = {
      colors: this.colors,
      chart: {
        width: this.width,
        type: this.isDonut ? "donut" : "pie"
      },
      series: this.data.getValues(),
      labels: this.data.getLabels(),
      fill: {
        type: this.fill,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200
            },
            legend: {
              position: "bottom"
            }
          }
        }
      ],
      title: {
        text: this.title,
        align: this.titleAlignment
      },
    };
  }
}
