import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Fight} from "../../models/fight";
import {Duel} from "../../models/duel";

@Component({
  selector: 'fight',
  templateUrl: './fight.component.html',
  styleUrls: ['./fight.component.scss']
})
export class FightComponent implements OnInit {

  @Input()
  fight: Fight;

  @Input()
  selected: boolean;

  @Input()
  over: boolean;

  @Output() onSelectedDuel: EventEmitter<any> = new EventEmitter();

  selectedDuel: Duel | undefined;

  ngOnInit(): void {
    // This is intentional
  }

  showTeamTitle(): boolean {
    if (this.fight?.tournament?.teamSize) {
      return this.fight.tournament.teamSize > 1;
    }
    return true;
  }

  selectDuel(duel: Duel) {
    this.selectedDuel = duel;
    this.onSelectedDuel.emit([duel]);
  }

  isOver(duel: Duel): boolean {
    if (this.over) {
      return true;
    }
    if (this.selectedDuel && this.selected) {
      return this.fight.duels.indexOf(duel) < this.fight.duels.indexOf(this.selectedDuel);
    }
    return false;
  }

}
