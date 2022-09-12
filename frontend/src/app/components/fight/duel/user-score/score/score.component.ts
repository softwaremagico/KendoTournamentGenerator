import {ChangeDetectionStrategy, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Duel} from "../../../../../models/duel";
import {DuelService} from "../../../../../services/duel.service";
import {Score} from "../../../../../models/score";
import {MessageService} from "../../../../../services/message.service";

@Component({
  selector: 'score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
})
export class ScoreComponent implements OnInit, OnChanges {

  @Input()
  index: number;

  @Input()
  duel: Duel;

  @Input()
  left: boolean;

  @Input()
  swapTeams: boolean;

  scoreRepresentation: string;

  constructor(private duelService: DuelService, private messageService: MessageService) {
  }

  ngOnInit(): void {
    // This is intentional
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['duel'] || changes['left'] || changes['swapTeams']) {
      this.scoreRepresentation = this.getScoreRepresentation();
    }
  }

  private updateDuel(score: Score) {
    if (score) {
      if (this.left) {
        if (score !== Score.EMPTY) {
          if (!this.swapTeams) {
            this.duel.competitor1Score[this.index] = score;
          } else {
            this.duel.competitor2Score[this.index] = score;
          }
        } else {
          if (!this.swapTeams) {
            this.duel.competitor1Score.splice(this.index, 1)
          } else {
            this.duel.competitor2Score.splice(this.index, 1)
          }
        }
      } else {
        if (score !== Score.EMPTY) {
          if (!this.swapTeams) {
            this.duel.competitor2Score[this.index] = score;
          } else {
            this.duel.competitor1Score[this.index] = score;
          }
        } else {
          if (!this.swapTeams) {
            this.duel.competitor2Score.splice(this.index, 1)
          } else {
            this.duel.competitor1Score.splice(this.index, 1)
          }
        }
      }
    }
    this.scoreRepresentation = this.getScoreRepresentation();
  }

  updateScore(score: Score) {
    this.updateDuel(score);
    this.duelService.update(this.duel).subscribe(duel => {
      this.messageService.infoMessage("Score Updated");
      return duel;
    });
  }

  getScoreRepresentation(): string {
    if (this.left) {
      if (!this.swapTeams) {
        return Score.tag(this.duel.competitor1Score[this.index]);
      } else {
        return Score.tag(this.duel.competitor2Score[this.index]);
      }
    } else {
      if (!this.swapTeams) {
        return Score.tag(this.duel.competitor2Score[this.index]);
      } else {
        return Score.tag(this.duel.competitor1Score[this.index]);
      }
    }
  }

  possibleScores(): Score[] {
    if (this.left) {
      if (!this.swapTeams) {
        if (!this.duel.competitor1) {
          return Score.clear();
        }
        if (!this.duel.competitor2) {
          return Score.noCompetitor();
        }
      } else {
        if (!this.duel.competitor2) {
          return Score.clear();
        }
        if (!this.duel.competitor1) {
          return Score.noCompetitor();
        }
      }
    } else {
      if (!this.swapTeams) {
        if (!this.duel.competitor2) {
          return Score.clear();
        }
        if (!this.duel.competitor1) {
          return Score.noCompetitor();
        }
      } else {
        if (!this.duel.competitor1) {
          return Score.clear();
        }
        if (!this.duel.competitor2) {
          return Score.noCompetitor();
        }
      }
    }
    return Score.toArray();
  }

}
