import {Component, OnInit} from '@angular/core';
//import {ClueStatus, GameState} from "../gamestate";
import {JArchiveService, Game} from "../jarchive.service";
import {MessageService} from "primeng/api";

@Component({
    selector: 'j-play',
    templateUrl: './play.component.html',
    styleUrls: ['./play.component.scss'],
    providers: [MessageService]
})
export class PlayComponent implements OnInit {
    //gamestate: GameState;
    game: Game;
    date: Date = new Date();
    roundLabel: string = 'Jeopardy';
    boardView: boolean = true;
    syncState = 'unsynced';

    constructor(private jarchive: JArchiveService, private messages: MessageService) { }

    ngOnInit(): void {
        //this.gamestate = new GameState();
        this.game = this.jarchive.getNewGame();
    }

    getGame () {
        //console.log(`${this.date.getFullYear()}-${this.date.getMonth()+1}-${this.date.getDate()}`);
        const datestr = `${this.date.getFullYear()}-${(this.date.getMonth() + 1).toString().padStart(2, '0')}-${this.date.getDate().toString().padStart(2, '0')}`;
        this.jarchive.getGameByDate(datestr).subscribe(game => this.game = game, err => console.log(err));
    }

    uploadGameData () {
        if (this.syncState === 'unsynced') {
            const clues = [];
            for (const item of this.game.log) {
                if (item.save) {
                    clues.push({
                        date: this.game.airdate,
                        round: item.clue.category.round.label,
                        category: item.clue.category.title,
                        value: item.clue.value,
                        clue: item.clue.clue,
                        correct: item.clue.correct
                    });
                }
            }
            const stats = this.game.getSummary();
            this.messages.add({severity: 'info', summary: 'Uploading...'});
            this.jarchive.postGameData(this.game.airdate, stats, clues).subscribe(
                () => {
                    this.syncState = 'synced';
                    this.messages.add({severity: 'success', summary: 'Upload complete'});
                }, (err) => {
                    console.error(`Error ${err}`);
                    this.syncState = 'unsynced';
                    this.messages.add({severity: 'error', summary: 'Upload failed'});
                });
        }
    }
}
