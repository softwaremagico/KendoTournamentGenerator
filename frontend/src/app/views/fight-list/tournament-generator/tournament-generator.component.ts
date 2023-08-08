import {Component, OnInit, ViewChild} from '@angular/core';
import {Group} from "../../../models/group";
import {Router} from "@angular/router";
import {RbacService} from "../../../services/rbac/rbac.service";
import {RbacBasedComponent} from "../../../components/RbacBasedComponent";
import {Tournament} from "../../../models/tournament";
import {TournamentService} from "../../../services/tournament.service";
import {GroupService} from "../../../services/group.service";
import {
  TournamentBracketsEditorComponent
} from "../../../components/tournament-brackets-editor/tournament-brackets-editor.component";

@Component({
  selector: 'app-tournament-generator',
  templateUrl: './tournament-generator.component.html',
  styleUrls: ['./tournament-generator.component.scss']
})
export class TournamentGeneratorComponent extends RbacBasedComponent implements OnInit {

  @ViewChild(TournamentBracketsEditorComponent)
  tournamentBracketsEditorComponent: TournamentBracketsEditorComponent;


  tournamentId: number;
  tournament: Tournament;

  constructor(private router: Router, rbacService: RbacService, private tournamentService: TournamentService, private groupService: GroupService) {
    super(rbacService);
    const state = this.router.getCurrentNavigation()?.extras.state;
    if (state) {
      if (state['tournamentId'] && !isNaN(Number(state['tournamentId']))) {
        this.tournamentId = Number(state['tournamentId']);
      } else {
        this.goBackToFights();
      }
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
}
