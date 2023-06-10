import {Component, HostListener, Input, OnChanges, OnInit, SimpleChanges, ViewEncapsulation} from '@angular/core';
import {Achievement} from "../../models/achievement.model";
import {AchievementGrade} from "../../models/achievement-grade.model";
import {TranslateService} from "@ngx-translate/core";
import {formatDate} from "@angular/common";
import {AchievementType} from "../../models/achievement-type.model";
import {NameUtilsService} from "../../services/name-utils.service";

@Component({
  selector: 'app-achievement-tile',
  templateUrl: './achievement-tile.component.html',
  styleUrls: ['./achievement-tile.component.scss'],
  // tooltip style not applied without this:
  encapsulation: ViewEncapsulation.None,
})
export class AchievementTileComponent implements OnInit, OnChanges {

  @Input()
  achievementType: AchievementType;

  @Input()
  achievements: Achievement[] | undefined | null;

  @Input()
  view: 'participant' | 'tournament';

  grade: AchievementGrade;
  mouseX: number | undefined;
  mouseY: number | undefined;
  screenHeight: number | undefined;
  screenWidth: number | undefined;
  onLeftBorder: boolean;
  onRightBorder: boolean;
  newAchievement: boolean;
  totalAchievements: number;

  tooltipHtml: string;

  constructor(private translateService: TranslateService, private nameUtils: NameUtilsService) {

  }


  ngOnInit(): void {
    this.grade = AchievementGrade.NORMAL;
    if (this.achievements) {
      for (const achievement of this.achievements) {
        if (achievement.achievementGrade == AchievementGrade.BRONZE &&
          this.grade != AchievementGrade.SILVER) {
          this.grade = AchievementGrade.BRONZE;
        }
        if (achievement.achievementGrade == AchievementGrade.SILVER) {
          this.grade = AchievementGrade.SILVER;
        }
        if (achievement.achievementGrade == AchievementGrade.GOLD) {
          this.grade = AchievementGrade.GOLD;
          break;
        }
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['achievements']) {
      this.newAchievement = this.isNewAchievement();
      this.totalAchievements = this.getTotalAchievements();
      this.tooltipHtml = this.tooltipText();
    }
    if (changes['view']) {
      this.tooltipHtml = this.tooltipText();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.calculateTooltipMargin();
  }

  getAchievementImage(): string {
    return "assets/achievements/" + this.achievementType.toLowerCase() + ".svg";
  }

  getAchievementAlt(): string {
    if (this.achievements && this.achievements.length > 0) {
      return this.achievements[0].achievementType.toLowerCase();
    }
    return "";
  }

  isNewAchievement(): boolean {
    //Tournaments views does not show new icon.
    if (this.view === 'tournament') {
      return false;
    }
    const today: Date = new Date();
    today.setDate(today.getDate() - 2);
    return this.achievements?.find((a: Achievement): boolean => new Date(a.createdAt) > today) !== undefined;
  }

  getTotalAchievements(): number {
    if (!this.achievements) {
      return 0;
    }
    return this.achievements?.length;
  }

  public get AchievementGrade() {
    return AchievementGrade;
  }

  tooltipText(): string {
    if (this.view === 'tournament') {
      return this.tournamentToolTipText();
    } else {
      return this.participantToolTipText();
    }
  }

  participantToolTipText(): string {
    if (!this.view || !this.achievements || this.achievements.length == 0) {
      return "";
    }
    let tooltipText: string = this.getAchievementDescription();
    if (this.achievements) {
      tooltipText += '<br>' + this.translateService.instant('achievementToolTipObtainedAt') + ':<br>';
      tooltipText += '<div class="tournament-list">';
      for (const achievement of this.achievements) {
        if (achievement.tournament) {
          tooltipText += '<div class="tournament-item">';
          tooltipText += '<div class="circle ';
          if (achievement.achievementGrade == AchievementGrade.NORMAL) {
            tooltipText += ' normal';
          }
          if (achievement.achievementGrade == AchievementGrade.BRONZE) {
            tooltipText += ' bronze';
          }
          if (achievement.achievementGrade == AchievementGrade.SILVER) {
            tooltipText += ' silver';
          }
          if (achievement.achievementGrade == AchievementGrade.GOLD) {
            tooltipText += ' gold';
          }
          tooltipText += '"></div>';
          tooltipText += achievement.tournament.name;
          const formattedDate: string = formatDate(achievement.tournament.createdAt, 'dd/MM/yyyy', navigator.language)
          tooltipText += ' (' + formattedDate + ')';

          //End of tournament item.
          tooltipText += '</div>';
        }
      }
      tooltipText += '</div>';
    }
    return tooltipText;
  }

  tournamentToolTipText(): string {
    if (!this.view || !this.achievements || this.achievements.length == 0) {
      return "";
    }
    let tooltipText: string = this.getAchievementDescription();
    if (this.achievements) {
      tooltipText += '<br>' + this.translateService.instant('achievementToolTipObtainedBy') + ':<br>';
      tooltipText += '<div class="tournament-list">';
      for (const achievement of this.achievements) {
        if (achievement.tournament) {
          tooltipText += '<div class="tournament-item">';
          tooltipText += '<div class="circle ';
          if (achievement.achievementGrade == AchievementGrade.NORMAL) {
            tooltipText += ' normal';
          }
          if (achievement.achievementGrade == AchievementGrade.BRONZE) {
            tooltipText += ' bronze';
          }
          if (achievement.achievementGrade == AchievementGrade.SILVER) {
            tooltipText += ' silver';
          }
          if (achievement.achievementGrade == AchievementGrade.GOLD) {
            tooltipText += ' gold';
          }
          tooltipText += '"></div>';
          tooltipText += '<span>' + this.nameUtils.getDisplayName(achievement.participant) + '</span>';

          //End of tournament item.
          tooltipText += '</div>';
        }
      }
      tooltipText += '</div>';
    }
    return tooltipText;
  }

  private getAchievementDescription(): string {
    if (!this.view || !this.achievements || this.achievements.length == 0) {
      return "";
    }
    const achievementTag: string = AchievementType.toCamel(this.achievements[0].achievementType);
    let tooltipText: string = '<b>' + this.translateService.instant(
        'achievement.' + achievementTag + '.title') + '</b><br>' +
      this.translateService.instant(
        'achievement.' + achievementTag + '.description') + '<br>';
    if (this.achievements.some(a => a.achievementGrade === AchievementGrade.BRONZE)) {
      tooltipText += '<br>' + this.translateService.instant('achievement.' + achievementTag + '.bronze') + ':<br>';
    }
    if (this.achievements.some(a => a.achievementGrade === AchievementGrade.BRONZE)) {
      tooltipText += '<br>' + this.translateService.instant('achievement.' + achievementTag + '.silver') + ':<br>';
    }
    if (this.achievements.some(a => a.achievementGrade === AchievementGrade.BRONZE)) {
      tooltipText += '<br>' + this.translateService.instant('achievement.' + achievementTag + '.gold') + ':<br>';
    }
    return tooltipText;
  }

  updateCoordinates($event: MouseEvent): void {
    this.mouseX = $event.clientX;
    this.mouseY = $event.clientY;
    this.calculateTooltipMargin();
  }

  clearCoordinates($event: MouseEvent): void {
    this.mouseX = undefined;
    this.mouseY = undefined;
  }


  calculateTooltipMargin(): void {
    this.screenHeight = window.innerHeight;
    this.screenWidth = window.innerWidth;
    this.onLeftBorder = false;
    this.onRightBorder = false;
    if (this.mouseX! - 150 < 0) {
      this.onLeftBorder = true;
    }
    if (this.mouseX! + 150 > this.screenWidth) {
      this.onRightBorder = true;
    }
  }
}
