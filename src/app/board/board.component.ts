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

  markClue (status: string) {
      if (status === 'unseen') {
          this.game.unlogClue(this.targetClue);
      } else if (this.targetClue.status === 'unseen') {
        this.game.logClue(this.targetClue);
      }
      this.targetClue.status = status;
      this.game.recalcScore();
      this.targetClue = null;
  }
}
