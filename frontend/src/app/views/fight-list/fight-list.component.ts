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

  filteredFights: Map<number, Fight[]>;
  filteredUnties: Map<number, Duel[]>;

  selectedFight: Fight | undefined;
  selectedDuel: Duel | undefined;
  selectedGroup: Group | undefined;

  tournament: Tournament;
  timer: boolean = false;
  private readonly tournamentId: number | undefined;
  groups: Group[];
  swappedColors: boolean = false;
  swappedTeams: boolean = false;
  membersOrder: boolean = false;
  isWizardEnabled: boolean;
  kingOfTheMountainType: TournamentType = TournamentType.KING_OF_THE_MOUNTAIN;
  showAvatars: boolean = false;

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
    this.swappedColors = this.userSessionService.getSwappedColors();
    this.swappedTeams = this.userSessionService.getSwappedTeams();
    this.filteredFights = new Map<number, Fight[]>();
    this.filteredUnties = new Map<number, Duel[]>();
    this.groups = [];
    let state = this.router.getCurrentNavigation()?.extras.state;
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
    this.untieAddedService.isDuelsAdded.pipe(takeUntil(this.destroySubject)).subscribe(() => {
      this.refreshFights();
    });
    this.groupUpdatedService.isGroupUpdated.pipe(takeUntil(this.destroySubject)).subscribe(_group => {
      this.replaceGroup(_group);
    })

    this.membersOrderChangedService.membersOrderChanged.pipe(takeUntil(this.destroySubject)).subscribe(_fight => {
      let onlyNewFights: boolean = false;
      let updatedFights: boolean = false;
      if (_fight && this.groups) {
        this.resetFilter();
        for (const group of this.groups) {
          for (const fight of group.fights) {
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
        }
        if (updatedFights) {
          this.fightService.updateAll(this.getFights()).subscribe();
        }
      }
      this.systemOverloadService.isTransactionalBusy.next(false);
    });
  }

  private replaceGroup(group: Group) {
    if (group && this.groups) {
      let selectedFightIndex: number | undefined;
      let selectedDuelIndex: number | undefined

      //Corrected selected items
      if (this.selectedFight) {
        for (const _group of this.groups) {
          if (_group.fights.indexOf(this.selectedFight)) {
            selectedFightIndex = _group.fights.indexOf(this.selectedFight);
          }
        }
        selectedDuelIndex = this.selectedFight?.duels.indexOf(this.selectedDuel!);
      }

      const groupIndex: number = this.groups.map(group => group.id).indexOf(group.id);
      this.groups.splice(groupIndex, 1, group);
      this.selectedGroup = this.groups[groupIndex];
      //this.fights = this.groups.flatMap((group) => group.fights);
      this.resetFilter();
      if (this.selectedGroup && this.selectedFight && selectedFightIndex) {
        this.selectFight(this.filteredFights.get(this.selectedGroup.id!)![selectedFightIndex]);
      } else {
        this.selectFight(undefined);
      }
      if (this.selectedFight && selectedDuelIndex && this.selectedFight?.duels[selectedDuelIndex]) {
        this.selectDuel(this.selectedFight.duels[selectedDuelIndex]);
      }
    }
  }

  private getFights(): Fight[] {
    return this.groups.flatMap((group) => group.fights);
  }

  private getUnties(): Duel[] {
    return this.groups.flatMap((group) => group.unties)
  }

  private refreshFights() {
    if (this.tournamentId) {
      this.tournamentService.get(this.tournamentId).subscribe(tournament => {
        this.tournament = tournament;
        this.isWizardEnabled = tournament.type != TournamentType.CUSTOMIZED;
        if (this.tournamentId) {
          this.groupService.getAllByTournament(this.tournamentId).subscribe(_groups => {
            if (!_groups) {
              this.messageService.errorMessage('No groups on tournament!');
            } else {
              this.setGroups(_groups);
            }
          });
        }
      });
    }
  }

  private setGroups(groups: Group[]) {
    groups.sort((a, b) => {
      if (a.level === b.level) {
        return a.index - b.index;
      }
      return a.level - b.level;
    });
    const fights = groups.flatMap((group) => group.fights);
    for (let fight of fights) {
      for (let duel of fight.duels) {
        if (duel.competitor1!.hasAvatar || duel.competitor2!.hasAvatar) {
          this.showAvatars = true;
        }
      }
    }
    this.groups = groups;
    if (groups.length > 0) {
      this.selectedGroup = groups[0];
    }

    this.resetFilter();
    //Use a timeout or refresh before the components are drawn.
    setTimeout(() => {
      if (!this.selectFirstUnfinishedDuel() && this.getUnties().length === 0) {
        this.showTeamsClassification(true);
      }
    }, 1000);
  }

  openConfirmationGenerateElementsDialog() {
    if (this.groups.length > 0) {
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
    //Ensure that is selected on the typical case.
    if (this.groups.length == 1) {
      this.selectedGroup = this.groups[0];
    }
    if (this.selectedGroup) {
      const fight: Fight = new Fight();
      fight.tournament = this.tournament;
      fight.shiaijo = 0;
      fight.level = this.selectedGroup.level;
      fight.duels = [];
      this.openAddFightDialog('Add a new Fight', Action.Add, fight, this.selectedGroup!, this.selectedFight);
    } else {
      this.messageService.warningMessage('errorFightNotSelected');
    }
  }

  editElement(): void {
    if (this.selectedFight && this.selectedGroup) {
      this.openAddFightDialog('Edit fight', Action.Update, this.selectedFight, this.selectedGroup, undefined);
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
          //Delete undraw.
          if (this.selectedDuel && this.selectedGroup && this.selectedDuel.type === DuelType.UNDRAW) {
            this.selectedGroup.unties.splice(this.selectedGroup.unties.indexOf(this.selectedDuel), 1);
            //Delete the fight.
          } else {
            if (this.selectedFight && this.selectedGroup) {
              this.selectedGroup.fights.splice(this.selectedGroup.fights.indexOf(this.selectedFight), 1);
            }
          }
          if (this.selectedGroup) {
            this.groupService.update(this.selectedGroup).subscribe(() => {
              this.messageService.infoMessage("fightDeleted");
              this.refreshFights();
            });
          }
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
        this.selectFirstUnfinishedDuel();
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
        this.selectedGroup = _group;
        if (this.tournamentId) {
          this.fightService.create(this.tournamentId, 0).subscribe(fights => {
            this.resetFilter();
            this.selectedGroup!.fights = fights;
            this.messageService.infoMessage("infoFightCreated");
          });
        }
      });
    }
  }

  updateRowData(fight: Fight) {
    this.fightService.update(fight).subscribe(() => {
        this.messageService.infoMessage("infoFightUpdated");
      }
    );
  }

  deleteRowData(fight: Fight) {
    this.fightService.delete(fight).subscribe(() => {
        this.selectedGroup!.fights = this.selectedGroup!.fights.filter(existing_fight => existing_fight !== fight);
        this.filteredFights.set(this.selectedGroup!.id!, this.filteredFights.get(this.selectedGroup!.id!)!.filter(existing_fight => existing_fight !== fight));
        this.messageService.infoMessage("fightDeleted");
      }
    );
  }

  goBackToTournament(): void {
    this.router.navigate(['/tournaments'], {});
  }

  selectFight(fight: Fight | undefined) {
    this.selectedFight = fight;
    if (fight) {
      this.selectedGroup = this.groups.find(group => group.fights.indexOf(fight) >= 0)!;
    } else {
      this.selectedGroup = undefined;
    }
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
    if (this.groups.length > 0 && this.getFights().length > 0) {
      this.dialog.open(TeamRankingComponent, {
        width: '85vw',
        data: {tournament: this.tournament, group: this.selectedGroup, finished: fightsFinished}
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
      if (!this.selectedDuel.finishedAt) {
        this.selectedDuel.finishedAt = new Date();
      }
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
      } else {
        if ((this.tournament && this.tournament.teamSize && this.tournament.teamSize > 1) ||
          (this.tournament && this.tournament.type === this.kingOfTheMountainType)) {
          this.showTeamsClassification(true);
        } else {
          this.showCompetitorsClassification();
        }
        this.finishTournament(new Date());
      }
    });
  }

  finishTournament(date: Date | undefined) {
    if (!this.tournament.finishedAt && date) {
      this.tournament.finishedAt = date;
      this.tournamentService.update(this.tournament).subscribe();
    } else if (!date && this.tournament.finishedAt) {
      this.tournament.finishedAt = undefined
      this.tournamentService.update(this.tournament).subscribe();
    }
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
    const fights: Fight[] = this.getFights();
    const unties: Duel[] = this.getUnties();
    if (fights) {
      for (const fight of fights) {
        for (const duel of fight.duels) {
          if (!duel.finished) {
            return false;
          }
        }
      }
      for (const duel of unties) {
        if (!duel.finished) {
          return false;
        }
      }
    }
    return true;
  }

  selectFirstUnfinishedDuel(): boolean {
    this.resetFilter();
    const fights: Fight[] = this.getFights();
    const unties: Duel[] = this.getUnties();
    if (fights) {
      for (const fight of fights) {
        for (const duel of fight.duels) {
          if (!duel.finished) {
            this.selectedFight = fight;
            this.selectDuel(duel);
            return true;
          }
        }
      }
      for (const duel of unties) {
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

  updateDuelElapsedTime(elapsedTime: number, updateBackend: boolean) {
    if (this.selectedDuel) {
      this.selectedDuel.duration = elapsedTime;
      if (updateBackend) {
        this.duelService.update(this.selectedDuel).subscribe();
      }
    }
  }

  duelStarted(elapsedTime: number) {
    if (this.selectedDuel && !this.selectedDuel.duration && !this.selectedDuel.startedAt) {
      this.selectedDuel.duration = elapsedTime;
      this.selectedDuel.startedAt = new Date();
      this.duelService.update(this.selectedDuel).subscribe();
    }
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
    this.filteredFights = new Map<number, Fight[]>();
    this.filteredUnties = new Map<number, Duel[]>();

    for (const group of this.groups) {
      if (group.fights) {
        this.filteredFights.set(group.id!, group.fights.filter(fight =>
          fight.team1.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
          fight.team2.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
          fight.team1.members.some(user => user !== undefined && (user.lastname.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
            user.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
            (user.club ? user.club.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) : ""))) ||
          fight.team2.members.some(user => user !== undefined && (user.lastname.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
            user.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) ||
            (user.club ? user.club.name.normalize('NFD').replace(/\p{Diacritic}/gu, "").toLowerCase().includes(filter) : "")))));
      } else {
        this.filteredFights.set(group.id!, []);
      }

      if (group.unties) {
        this.filteredUnties.set(group.id!, group.unties.filter(duel =>
          duel.competitor1!.lastname.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) ||
          duel.competitor1!.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) || duel.competitor1!.idCard.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) ||
          (duel.competitor1!.club ? duel.competitor1!.club.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) : "") ||

          duel.competitor2!.lastname.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) ||
          duel.competitor2!.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) || duel.competitor2!.idCard.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) ||
          (duel.competitor2!.club ? duel.competitor2!.club.name.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, "").includes(filter) : "")));
      } else {
        this.filteredUnties.set(group.id!, []);
      }
    }
  }

  resetFilter() {
    this.filter('');
    this.resetFilterValue.next(true);
  }
}
