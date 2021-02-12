import { Component, OnInit, Input } from '@angular/core';
//import {GameState, ClueStatus} from "../gamestate";
import {Category, Clue, Game} from "../jarchive.service";

@Component({
  selector: 'j-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
  @Input() game: Game;
  targetClue: Clue = null;

  constructor() { }

  ngOnInit(): void {
  }

  openClue (category: number, row: number) {
      this.targetClue = this.game.getClue(category, row);
  }

  markFJClue (status: string) {
      const clue = this.game.rounds['Final Jeopardy'].categories[0].clues[0];
      clue.status = status;
      this.game.logClue(clue);
  }

  markClue (status: string) {
      const oldstatus = this.targetClue.status;
      this.targetClue.status = status;
      if (status === 'unseen') {
          this.game.unlogClue(this.targetClue);
      } else if (oldstatus === 'unseen') {
        this.game.logClue(this.targetClue);
      }
      this.game.recalcScore();
      this.targetClue = null;
  }
}
