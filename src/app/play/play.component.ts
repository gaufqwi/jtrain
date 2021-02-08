import {Component, OnInit} from '@angular/core';
//import {ClueStatus, GameState} from "../gamestate";
import {JArchiveService, Game} from "../jarchive.service";

@Component({
  selector: 'j-play',
  templateUrl: './play.component.html',
  styleUrls: ['./play.component.scss']
})
export class PlayComponent implements OnInit {
  //gamestate: GameState;
  game: Game;
  date: Date = new Date();
  roundLabel: string = 'Jeopardy';
  boardView: boolean = true;

  constructor(private jarchive: JArchiveService) { }

  ngOnInit(): void {
    //this.gamestate = new GameState();
    this.game = this.jarchive.getNewGame();
  }

  getGame () {
    //console.log(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${this.date.getDate()}`);
    const datestr = `${this.date.getFullYear()}-${(this.date.getMonth() + 1).toString().padStart(2, '0')}-${this.date.getDate().toString().padStart(2, '0')}`;
    this.jarchive.getGameByDate(datestr).subscribe(game => this.game = game);
  }

}
