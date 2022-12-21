import {Component, OnDestroy, OnInit} from '@angular/core';
import {MatDialog} from "@angular/material/dialog";
import {MessageService} from "../../services/message.service";
import {FightService} from "../../services/fight.service";
import {Fight} from "../../models/fight";
import {Tournament} from "../../models/tournament";
import {Router} from "@angular/router";
import {TournamentService} from "../../services/tournament.service";
import {Action} from "../../action";
import {FightDialogBoxComponent} from "./fight-dialog-box/fight-dialog-box.component";
import {TournamentType} from "../../models/tournament-type";
import {LeagueGeneratorComponent} from "./league-generator/league-generator.component";
import {GroupService} from "../../services/group.service";
import {Team} from "../../models/team";
import {ConfirmationDialogComponent} from "../../components/basic/confirmation-dialog/confirmation-dialog.component";
import {TeamRankingComponent} from "./team-ranking/team-ranking.component";
import {CompetitorsRankingComponent} from "./competitors-ranking/competitors-ranking.component";
import {TranslateService} from "@ngx-translate/core";
import {Duel} from "../../models/duel";
import {DuelService} from "../../services/duel.service";
import {TimeChangedService} from "../../services/notifications/time-changed.service";
import {DuelChangedService} from "../../services/notifications/duel-changed.service";
import {UntieAddedService} from "../../services/notifications/untie-added.service";
import {Group} from "../../models/group";
import {DuelType} from "../../models/duel-type";
import {UserSessionService} from "../../services/user-session.service";
import {MembersOrderChangedService} from "../../services/notifications/members-order-changed.service";
import {Subject, takeUntil} from "rxjs";
import {Score} from "../../models/score";
import {RbacBasedComponent} from "../../components/RbacBasedComponent";
import {RbacService} from "../../services/rbac/rbac.service";
import {GroupUpdatedService} from "../../services/notifications/group-updated.service";
import {SystemOverloadService} from "../../services/notifications/system-overload.service";

@Component({
  selector: 'app-fight-list',
  templateUrl: './fight-list.component.html',
  styleUrls: ['./fight-list.component.scss']
})
export class FightListComponent extends RbacBasedComponent implements OnInit, OnDestroy {

  fights: Fight[];
  filteredFights: Fight[];
  unties: Duel[];
  filteredUnties: Duel[];
  selectedFight: Fight | undefined;
  selectedDuel: Duel | undefined;
  tournament: Tournament;
  timer: boolean = false;
  private readonly tournamentId: number | undefined;
  groups: Group[];
  swappedColors: boolean = false;
  swappedTeams: boolean = false;
  membersOrder: boolean = false;
  isWizardEnabled: boolean;
  kingOfTheMountainType: TournamentType = TournamentType.KING_OF_THE_MOUNTAIN;
  selectedGroup: number = 0;

  resetFilterValue: Subject<boolean> = new Subject();

  resetTimerPosition: Subject<boolean> = new Subject();

  constructor(private router: Router, private tournamentService: TournamentService, private fightService: FightService,
              private groupService: GroupService, private duelService: DuelService,
              private timeChangedService: TimeChangedService, private duelChangedService: DuelChangedService,
              private untieAddedService: UntieAddedService, private groupUpdatedService: GroupUpdatedService,
              private dialog: MatDialog, private userSessionService: UserSessionService,
              private membersOrderChangedService: MembersOrderChangedService, private messageService: MessageService,
              private translateService: TranslateService, rbacService: RbacService,
              private systemOverloadService: SystemOverloadService) {
    super(rbacService);
    let state = this.router.getCurrentNavigation()?.extras.state;
    this.swappedColors = this.userSessionService.getSwappedColors();
    this.swappedTeams = this.userSessionService.getSwappedTeams();
    if (state) {
      if (state['tournamentId'] && !isNaN(Number(state['tournamentId']))) {
        this.tournamentId = Number(state['tournamentId']);
      } else {
        this.goBackToTournament();
      }
    } else {
      this.goBackToTournament();
    }
  }

  ngOnInit(): void {
    this.systemOverloadService.isTransactionalBusy.next(true);
    this.refreshFights();
    this.refreshUnties();
    this.untieAddedService.isDuelsAdded.pipe(takeUntil(this.destroySubject)).subscribe(() => {
      this.refreshUnties();
    });
    this.groupUpdatedService.isGroupUpdated.pipe(takeUntil(this.destroySubject)).subscribe(_group => {
      this.replaceGroup(_group);
    })

    this.membersOrderChangedService.membersOrderChanged.pipe(takeUntil(this.destroySubject)).subscribe(_fight => {
      let onlyNewFights: boolean = false;
      let updatedFights: boolean = false;
      if (_fight && this.fights) {
        this.resetFilter();
        for (const fight of this.fights) {
          if (onlyNewFights && fight.team1.id === _fight.team1.id) {
            for (let i = 0; i < this.tournament.teamSize; i++) {
              if (!fight.duels[i].duration) {
                fight.duels[i].competitor1 = _fight.duels[i].competitor1;
                this.duelChangedService.isDuelUpdated.next(fight.duels[i]);
                updatedFights = true;
              }
            }
          } else if (onlyNewFights && fight.team2.id === _fight.team2.id) {
            for (let i = 0; i < this.tournament.teamSize; i++) {
              if (!fight.duels[i].duration) {
                fight.duels[i].competitor2 = _fight.duels[i].competitor2;
                this.duelChangedService.isDuelUpdated.next(fight.duels[i]);
                updatedFights = true;
              }
            }
          }
          //Only this fight and the next ones. Not the previous ones.
          if (fight === _fight) {
            onlyNewFights = true;
          }
        }
        if (updatedFights) {
          this.fightService.updateAll(this.fights).subscribe();
        }
      }
      this.systemOverloadService.isTransactionalBusy.next(false);
    });
  }

  private replaceGroup(group: Group) {
    if (group && this.groups) {
      const selectedFightIndex: number | undefined = this.filteredFights.indexOf(this.selectedFight!);
      const selectedDuelIndex: number | undefined = this.selectedFight?.duels.indexOf(this.selectedDuel!);
      const groupIndex = this.groups.map(group => group.id).indexOf(group.id);
      this.groups.splice(groupIndex, 1, group);
      this.fights = this.groups.flatMap((group) => group.fights);
      this.resetFilter();
      this.selectFight(this.filteredFights[selectedFightIndex]);
      this.selectDuel(this.selectedFight?.duels[selectedDuelIndex!]!);
    }
  }

  private refreshFights() {
    if (this.tournamentId) {
      this.tournamentService.get(this.tournamentId).subscribe(tournament => {
        this.tournament = tournament;
        this.isWizardEnabled = tournament.type != TournamentType.CUSTOMIZED;
        if (this.tournamentId) {
          this.groupService.getAllByTournament(this.tournamentId).subscribe(groups => {
            this.groups = groups;
            this.groups.sort((a, b) => {
              if (a.level === b.level) {
                return a.index - b.index;
              }
              return a.level - b.level;
            });
            this.fights = groups.flatMap((group) => group.fights);
            this.resetFilter();
            //Use a timeout or refresh before the components are drawn.
            setTimeout(() => {
              if (!this.selectFirstUnfinishedDuel() && this.unties.length === 0) {
                this.showTeamsClassification(true);
              }
            }, 1000);
          });
        }
      });
    }
  }

  private refreshUnties() {
    if (this.tournamentId) {
      this.duelService.getUntiesFromTournament(this.tournamentId).subscribe(duels => {
        this.unties = duels;
        this.filteredUnties = this.unties;
        //Use a timeout or refresh before the components are drawn.
        setTimeout(() => {
          if (!this.selectFirstUnfinishedDuel() && this.unties.length > 0) {
            this.showTeamsClassification(true);
          }
        }, 1000);
      });
    }
  }

  openConfirmationGenerateElementsDialog() {
    if (this.fights.length > 0) {
      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: false
      });
      dialogRef.componentInstance.messageTag = "deleteFightsWarning"

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.generateElements();
        }
      });
    } else {
      this.generateElements();
    }
  }

  generateElements() {
    let dialogRef;
    if (this.tournament.type === TournamentType.LEAGUE || this.tournament.type === TournamentType.LOOP ||
      this.tournament.type === TournamentType.KING_OF_THE_MOUNTAIN) {
      dialogRef = this.dialog.open(LeagueGeneratorComponent, {
        width: '85vw',
        data: {title: 'Create Fights', action: Action.Add, tournament: this.tournament}
      });
    }

    if (dialogRef) {
      dialogRef.afterClosed().subscribe(result => {
        if (result == undefined) {
          //Do nothing
        } else if (result.action === Action.Add) {
          this.createGroupFight(result.data);
        } else if (result.action === Action.Update) {
          this.updateRowData(result.data);
        } else if (result.action === Action.Delete) {
          this.deleteRowData(result.data);
        }
      });
    }
  }

  getDuelDefaultSecondsDuration() {
    if (this.tournament) {
      return this.tournament.duelsDuration % 60;
    }
    return 0;
  }

  getDuelDefaultMinutesDuration() {
    if (this.tournament) {
      return Math.floor(this.tournament.duelsDuration / 60);
    }
    return 0;
  }

  addElement() {
    const group: Group = this.groups[this.selectedGroup];
    const fight: Fight = new Fight();
    fight.tournament = group.tournament;
    fight.shiaijo = 0;
    fight.level = group.level;
    fight.duels = [];
    this.openAddFightDialog('Add a new Fight', Action.Add, fight, group, this.selectedFight);
  }

  editElement(): void {
    if (this.selectedFight) {
      this.openAddFightDialog('Edit fight', Action.Update, this.selectedFight, this.groups[this.selectedGroup], undefined);
    }
  }

  deleteElement(): void {
    if (this.selectedFight || this.selectedDuel) {
      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        disableClose: false
      });
      dialogRef.componentInstance.messageTag = "deleteFightWarning"
      dialogRef.componentInstance.parameters = {
        team1: !this.swappedTeams ? (this.selectedFight?.team1.name) : (this.selectedFight?.team2.name),
        team2: !this.swappedTeams ? (this.selectedFight?.team2.name) : (this.selectedFight?.team1.name),
      }

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          //Delete the undraw.
          if (this.selectedDuel && this.selectedDuel.type === DuelType.UNDRAW) {
            this.groups[this.selectedGroup].unties.splice(this.groups[this.selectedGroup].unties.indexOf(this.selectedDuel), 1);
            //Delete the fight.
          } else {
            if (this.selectedFight) {
              this.groups[this.selectedGroup].fights.splice(this.groups[this.selectedGroup].fights.indexOf(this.selectedFight), 1);
            }
          }
          this.groupService.update(this.groups[this.selectedGroup]).subscribe(group => {
            this.messageService.infoMessage("fightDeleted");
            this.refreshFights();
            this.refreshUnties();
          });
        }
      });
    }
  }

  openAddFightDialog(title: string, action: Action, fight: Fight, group: Group, afterFight: Fight | undefined) {
    const dialogRef = this.dialog.open(FightDialogBoxComponent, {
      width: '90vw',
      height: '95vh',
      maxWidth: '1000px',
      data: {
        title: 'Add a new Fight',
        action: Action.Add,
        entity: fight,
        group: group,
        previousFight: afterFight,
        tournament: this.tournament,
        swappedColors: this.swappedColors,
        swappedTeams: this.swappedTeams
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined) {
        //Do nothing
      } else if (result.action === Action.Add) {
        //this.createGroupFight();
      } else if (result.action === Action.Update) {
        this.updateRowData(result.data);
      } else if (result.action === Action.Delete) {
        this.deleteRowData(result.data);
      }
    });
  }

  createGroupFight(teams: Team[]) {
    if (this.tournamentId) {
      this.groupService.setTeams(teams).subscribe(_group => {
        this.groups[this.selectedGroup] = _group;
        this.fights = [];
        this.filteredFights = [];
        if (this.tournamentId) {
          this.fightService.create(this.tournamentId, 0).subscribe(fights => {
            this.fights = fights;
            this.resetFilter();
            this.groups[this.selectedGroup].fights = fights;
            this.messageService.infoMessage("infoFightCreated");
          });
        }
      });
    }
  }

  addRowData(fights: Fight[]) {
    this.fightService.addCollection(fights).subscribe(_fights => {
      this.fights.push(..._fights);
      this.filteredFights.push(..._fights);
      this.messageService.infoMessage("fightStored");
    });
  }

  updateRowData(fight: Fight) {
    this.fightService.update(fight).subscribe(() => {
        this.messageService.infoMessage("infoFightUpdated");
      }
    );
  }

  deleteRowData(fight: Fight) {
    this.fightService.delete(fight).subscribe(() => {
        this.fights = this.fights.filter(existing_fight => existing_fight !== fight);
        this.filteredFights = this.filteredFights.filter(existing_fight => existing_fight !== fight);
        this.messageService.infoMessage("fightDeleted");
      }
    );
  }

  goBackToTournament(): void {
    this.router.navigate(['/tournaments'], {});
  }

  selectFight(fight: Fight) {
    this.selectedFight = fight;
    this.selectedGroup = this.groups.findIndex(group => group.fights.indexOf(fight) >= 0);
  }

  isFightOver(fight: Fight): boolean {
    if (fight) {
      if (!fight.duels) {
        return false;
      }
      for (const duel of fight.duels) {
        if (!duel.finished) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  showTeamsClassification(fightsFinished: boolean) {
    if (this.groups.length > 0 && this.fights.length > 0) {
      this.dialog.open(TeamRankingComponent, {
        width: '85vw',
        data: {tournament: this.tournament, groupId: this.groups[this.selectedGroup].id, finished: fightsFinished}
      });
    }
  }

  showCompetitorsClassification() {
    this.dialog.open(CompetitorsRankingComponent, {
      width: '85vw',
      data: {tournament: this.tournament}
    });
  }

  downloadPDF() {
    if (this.tournament && this.tournament.id) {
      this.fightService.getFightSummaryPDf(this.tournament.id).subscribe((pdf: Blob) => {
        const blob = new Blob([pdf], {type: 'application/pdf'});
        const downloadURL = window.URL.createObjectURL(blob);

        const anchor = document.createElement("a");
        anchor.download = "Fight List - " + this.tournament!.name + ".pdf";
        anchor.href = downloadURL;
        anchor.click();
      });
    }
  }

  showTimer(show: boolean) {
    this.timer = show;
    this.resetTimerPosition.next(show);
  }

  setIpponScores(duel: Duel) {
    //Put default points.
    if (duel.competitor1 !== null && duel.competitor2 == null) {
      duel.competitor1Score = [];
      duel.competitor1Score.push(Score.IPPON);
      duel.competitor1Score.push(Score.IPPON);
    } else if (duel.competitor2 !== null && duel.competitor1 == null) {
      duel.competitor2Score = [];
      duel.competitor2Score.push(Score.IPPON);
      duel.competitor2Score.push(Score.IPPON);
    }
  }

  canStartFight(duel: Duel | undefined): boolean {
    return duel !== undefined && duel.competitor1 !== null && duel.competitor2 !== null;
  }

  finishDuel(finished: boolean) {
    if (this.selectedDuel) {
      this.setIpponScores(this.selectedDuel);
      this.selectedDuel.finished = finished;
      this.duelService.update(this.selectedDuel).subscribe(duel => {
        this.messageService.infoMessage("infoDuelFinished");
        if (!this.selectFirstUnfinishedDuel()) {
          this.generateNextFights();
        }
        return duel;
      });
    }
  }

  generateNextFights(): void {
    this.fightService.createNext(this.tournamentId!).subscribe(_fights => {
      if (_fights.length > 0) {
        this.refreshFights();
        this.refreshUnties();
      } else {
        if ((this.tournament && this.tournament.teamSize && this.tournament.teamSize > 1) ||
          (this.tournament && this.tournament.type === this.kingOfTheMountainType)) {
          this.showTeamsClassification(true);
        } else {
          this.showCompetitorsClassification();
        }
      }
    });
  }

  selectDuel(duel: Duel) {
    this.selectedDuel = duel;
    this.duelChangedService.isDuelUpdated.next(duel);
    if (duel) {
      if (duel.duration) {
        this.timeChangedService.isElapsedTimeChanged.next(duel.duration);
      } else {
        this.timeChangedService.isElapsedTimeChanged.next(0);
      }
    }
    if (duel) {
      if (duel.totalDuration) {
        this.timeChangedService.isTotalTimeChanged.next(duel.totalDuration);
      } else {
        this.timeChangedService.isTotalTimeChanged.next(this.tournament.duelsDuration);
      }
    }
  }

  isOver(duel: Duel): boolean {
    return duel.finished;
  }

  areAllDuelsOver(): boolean {
    if (this.fights) {
      for (const fight of this.fights) {
        for (const duel of fight.duels) {
          if (!duel.finished) {
            return false;
          }
        }
      }
      for (const duel of this.unties) {
        if (!duel.finished) {
          return false;
        }
      }
    }
    return true;
  }

  selectFirstUnfinishedDuel(): boolean {
    this.resetFilter();
    if (this.fights) {
      for (const fight of this.fights) {
        for (const duel of fight.duels) {
          if (!duel.finished) {
            this.selectedFight = fight;
            this.selectDuel(duel);
            return true;
          }
        }
      }
      for (const duel of this.unties) {
        if (!duel.finished) {
          this.selectedFight = undefined;
          this.selectDuel(duel);
          return true;
        }
      }
    }
    return false;
  }

  updateDuelDuration(duelDuration: number) {
    if (this.selectedDuel) {
      this.selectedDuel.totalDuration = duelDuration;
      this.duelService.update(this.selectedDuel).subscribe();
    }
  }

  updateDuelElapsedTime(elapsedTime: number) {
    if (this.selectedDuel) {
      this.selectedDuel.duration = elapsedTime;
      this.duelService.update(this.selectedDuel).subscribe();
    }
  }

  showTeamTitle(): boolean {
    if (this.tournament?.teamSize) {
      return this.tournament.teamSize > 1;
    }
    return true;
  }

  showSelectedRelatedButton(): boolean {
    return !(this.selectedFight !== undefined || (this.selectedDuel !== undefined && this.selectedDuel.type === DuelType.UNDRAW));
  }

  swapColors() {
    this.swappedColors = !this.swappedColors;
    this.userSessionService.setSwappedColors(this.swappedColors);
  }

  swapTeams() {
    this.swappedTeams = !this.swappedTeams;
    this.userSessionService.setSwappedTeams(this.swappedTeams);
  }

  enableMemberOrder(enabled: boolean) {
    this.membersOrder = enabled;
    this.membersOrderChangedService.membersOrderAllowed.next(enabled);
  }

  filter(filter: string) {
    filter = filter.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "");
    this.filteredFights = this.fights!.filter(fight =>
      fight.team1.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
      fight.team2.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
      fight.team1.members.some(user => user !== undefined && (user.lastname.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
        user.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
        (user.club ? user.club.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) : ""))) ||
      fight.team2.members.some(user => user !== undefined && (user.lastname.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
        user.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
        (user.club ? user.club.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) : "")))
    );

    this.filteredUnties = this.unties!.filter(duel =>
      duel.competitor1!.lastname.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) ||
      duel.competitor1!.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) || duel.competitor1!.idCard.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) ||
      (duel.competitor1!.club ? duel.competitor1!.club.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) : "") ||

      duel.competitor2!.lastname.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) ||
      duel.competitor2!.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) || duel.competitor2!.idCard.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) ||
      (duel.competitor2!.club ? duel.competitor2!.club.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) : "")
    );
  }

  resetFilter(){
    this.filter('');
    this.resetFilterValue.next(true);
  }
}
