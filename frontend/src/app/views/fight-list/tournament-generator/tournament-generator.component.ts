import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {RbacService} from "../../../services/rbac/rbac.service";
import {RbacBasedComponent} from "../../../components/RbacBasedComponent";
import {Tournament} from "../../../models/tournament";
import {TournamentService} from "../../../services/tournament.service";
import {
  TournamentBracketsEditorComponent
} from "../../../components/tournament-brackets-editor/tournament-brackets-editor.component";
import {ConfirmationDialogComponent} from "../../../components/basic/confirmation-dialog/confirmation-dialog.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {Fight} from "../../../models/fight";
import {FightService} from "../../../services/fight.service";
import {MessageService} from "../../../services/message.service";
import {GroupService} from "../../../services/group.service";
import {Group} from "../../../models/group";
import {
  GroupsUpdatedService
} from "../../../components/tournament-brackets-editor/tournament-brackets/groups-updated.service";

@Component({
  selector: 'app-tournament-generator',
  templateUrl: './tournament-generator.component.html',
  styleUrls: ['./tournament-generator.component.scss']
})
export class TournamentGeneratorComponent extends RbacBasedComponent implements OnInit {

  @ViewChild(TournamentBracketsEditorComponent)
  tournamentBracketsEditorComponent: TournamentBracketsEditorComponent;

  groupsDisabled: boolean = true;

  tournamentId: number;
  tournament: Tournament;
  isWizardEnabled: boolean = true;

  constructor(private router: Router, rbacService: RbacService, private tournamentService: TournamentService,
              private dialog: MatDialog, private fightService: FightService, private messageService: MessageService,
              private groupService: GroupService, private groupsUpdatedService: GroupsUpdatedService) {
    super(rbacService);
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      if (state['tournamentId'] && !isNaN(Number(state['tournamentId']))) {
        this.tournamentId = Number(state['tournamentId']);
      } else {
        this.goBackToFights();
      }
      this.groupsDisabled = state['editionDisabled'];
    } else {
      this.goBackToFights();
    }
  }

  ngOnInit(): void {
    this.tournamentService.get(this.tournamentId).subscribe((tournament: Tournament): void => {
      this.tournament = tournament;
    });
  }

  goBackToFights(): void {
    this.router.navigate(['/tournaments/fights'], {state: {tournamentId: this.tournamentId}});
  }

  addGroup(): void {
    this.tournamentBracketsEditorComponent.addGroup();
  }

  deleteGroup(): void {
    //this.tournamentBracketsEditorComponent.deleteGroup(this.tournamentBracketsEditorComponent.selectedGroup);
    this.tournamentBracketsEditorComponent.deleteLast();
  }

  openConfirmationGenerateElementsDialog(): void {
    let dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.messageTag = "deleteFightsWarning"

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.generateElements();
      }
    });
  }

  generateElements(): void {
    this.fightService.create(this.tournamentId, 0).subscribe((fights: Fight[]): void => {
      this.messageService.infoMessage("infoFightCreated");
      this.goBackToFights();
    });
  }

  askToRemoveAllTeams(): void {
    let dialogRef: MatDialogRef<ConfirmationDialogComponent> = this.dialog.open(ConfirmationDialogComponent, {
      disableClose: false
    });
    dialogRef.componentInstance.messageTag = "questionDeleteTeams"

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.removeAllTeams();
      }
    });
  }

  removeAllTeams(): void {
    this.groupService.deleteAllTeamsFromTournament(this.tournamentId).subscribe((_groups: Group[]): void => {
      this.groupsUpdatedService.areTeamListUpdated.next([]);
    })
  }
}