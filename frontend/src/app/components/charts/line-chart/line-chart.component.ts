import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill, ApexLegend,
  ApexMarkers,
  ApexPlotOptions,
  ApexStroke,
  ApexTitleSubtitle,
  ApexXAxis,
  ApexYAxis,
  ChartComponent
} from "ng-apexcharts";
import {Colors} from "../colors";
import {LineChartData} from "./line-chart-data";
import {DarkModeService} from "../../../services/notifications/dark-mode.service";
import {UserSessionService} from "../../../services/user-session.service";
import {CustomChartComponent} from "../CustomChartComponent";


export type LineChartOptions = {
  series: ApexAxisChartSeries;
  colors: string [];
  chart: ApexChart;
  labels: ApexDataLabels;
  fill: ApexFill;
  plotOptions: ApexPlotOptions;
  stroke: ApexStroke;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  title: ApexTitleSubtitle;
  legend: ApexLegend;
  markers: ApexMarkers;
};

type UpdateLineChartOptions = {
  xaxis: ApexXAxis;
};

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent extends CustomChartComponent {

  @ViewChild('chart')
  chart!: ChartComponent;

  public chartOptions: LineChartOptions;

  @Input()
  public data: LineChartData;
  @Input()
  public height: number = 250;
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
  @Input()
  public fill: "gradient" | "solid" | "pattern" | "image" = "solid";
  @Input()
  public curve: "straight" | "smooth" | "stepline" = "smooth";
  @Input()
  public legendPosition: 'left' | 'bottom' | 'right' | 'top' = "bottom";
  @Input()
  public shadow: boolean = true;
  @Input()
  public strokeWidth: number = 5;

  constructor(darkModeService: DarkModeService, userSessionService: UserSessionService) {
    super(darkModeService, userSessionService);
  }


  protected setProperties(): void {
    this.chartOptions = {
      colors: this.colors,
      series: this.data.getData(),
      chart: {
        height: this.height,
        width: this.width,
        type: "line",
        toolbar: {
          show: this.showToolbar,
        },
        dropShadow: {
          enabled: this.shadow,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2
        },
      },
      labels: {
        enabled: this.showValuesLabels,
        style: {
          fontFamily: 'Roboto',
        },
      },
      fill: {
        type: this.fill,
      },
      plotOptions: {
        bar: {
          distributed: true, // this line is mandatory for using colors
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
        },
        labels: {
          style: {
            fontFamily: 'Roboto',
            colors: this.axisTextColor
          },
        },
      },
      yaxis: {
        show: this.showYAxis,
        title: {
          text: this.yAxisTitle
        },
        labels: {
          style: {
            fontFamily: 'Roboto',
            colors: this.axisTextColor
          },
        },
      },
      stroke: {
        curve: this.curve,
        width: this.strokeWidth,
      },
      title: {
        text: this.title,
        align: this.titleAlignment,
        style: {
          fontSize: '14px',
          fontWeight: 'bold',
          fontFamily: 'Roboto',
          color: this.titleTextColor
        },
      },
      legend: {
        position: this.legendPosition,
        labels: {
          colors: this.legendTextColor,
          useSeriesColors: false
        },
      },
      markers: {
        size: 0
      },
    };
  }

  update(data: LineChartData) {
    this.chart.updateSeries(data.getData());
    const updateOptions: UpdateLineChartOptions = {
      xaxis: {
        categories: data.getLabels(),
        position: this.xAxisOnTop ? 'top' : 'bottom',
        title: {
          text: this.xAxisTitle
        }
      }
    }
    this.chart.updateOptions(updateOptions);
  }
}
