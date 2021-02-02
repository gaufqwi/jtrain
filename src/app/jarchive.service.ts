import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

const gameFilter = game => new Game(game as GameInterface);
const logGame = game => {console.log(game); return game};

@Injectable({
  providedIn: 'root'
})
export class JArchiveService {
  private server = 'http://localhost';
  private port = 4200;

  constructor(private http: HttpClient) { }

  testAPI () {
    this.http.get(`${this.server}:${this.port}/api/test`).subscribe(data => console.log('Response', data));
  }

  getNewGame (): Game {
      return new Game();
  }

  getGameById (jid: number): Observable<Game> {
      return this.http.get(`${this.server}:${this.port}/api/jbyid/${jid}`).pipe(map(gameFilter));
  }

  getGameByDate (date: string): Observable<Game> {
      return this.http.get(`${this.server}:${this.port}/api/jbydate/${date}`).pipe(map(gameFilter));
  }
}

// Types

interface ClueInterface {
    value: number;
    dd: boolean;
    ts: boolean ;
    clue: string;
    correct: string;
    media: string;
}

export class Clue {
    public value: number;
    public dd: boolean = false;
    public ts: boolean = false;
    public clue: string = '';
    public correct: string = '';
    public media: string[] = [];
    public status: string = 'unseen';
    public category: Category;

    constructor (value: (number|ClueInterface)) {
        if (typeof value === "number") {
            this.value = value;
        } else {
            //let clue = value as ClueInterface;
            Object.assign(this, value);
        }
    }

}

interface CategoryInterface {
    title: string;
    clues: ClueInterface[] | Clue[];
}

export class Category {
    public title: string;
    public clues: (Clue | null)[] = [];
    public round: Round;

    constructor (position: (number|CategoryInterface), increment: number = null) {
        if (typeof position === 'number') {
            this.title = `Category ${position}`;
            for (let i = 1; i <= 5; i++) {
                this.clues.push(new Clue(i * increment));
            }
        } else {
            //let category = position as CategoryInterface;
            for (let i = 0; i < position.clues.length; i++) {
                if (position.clues[i]) {
                    position.clues[i] = new Clue(position.clues[i] as ClueInterface);
                }
            }
            Object.assign(this, position);
        }
        for (const clue of this.clues) {
            clue.category = this;
        }
    }
}

interface RoundInterface {
    label: string;
    categories: CategoryInterface[] | Category[];
}

export class Round {
    public label: string;
    public categories: Category[] = [];
    public game: Game;

    constructor (label: (string|RoundInterface), increment: number = null) {
        if (typeof label === "string") {
            this.label = label;
            //const increment = (label === 'Jeopardy' ? 200 : 400);
            for (let i = 1; i <= 6; i++) {
                this.categories.push(new Category(i, increment));
            }
        } else {
            //let round = label as RoundInterface;
            for (let i = 0; i < label.categories.length; i++) {
                label.categories[i] = new Category(label.categories[i] as CategoryInterface);
            }
            Object.assign(this, label);
        }
        for (const category of this.categories) {
            category.round = this;
        }
    }
}

interface GameInterface {
    airdate: string;
    coryats: object;
    rounds: object;
}

export class Game {
    public airdate: string;
    public coryats: object = {};
    public rounds: object = {};
    public score: number = 0;

    private round: Round;
    public log: object[] = [];

    constructor (game: GameInterface = null) {
        if (game) {
            for (const key in game.rounds) {
                game.rounds[key] = new Round(game.rounds[key]);
            }
            Object.assign(this, game);
        } else {
            const now = new Date();
            this.airdate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
            this.rounds['Jeopardy'] = new Round('Jeopardy', 200);
            this.rounds['Double Jeopardy'] = new Round('Double Jeopardy', 400);
        }
        for (const key in this.rounds) {
            this.rounds[key].game = this;
        }
        this.round = this.rounds['Jeopardy'];
    }

    setRound (label: string) {
        this.round = this.rounds[label];
    }

    getCategories (): string[] {
        const categories = [];
        for (const category of this.round.categories) {
            //console.log('C', category);
            categories.push(category.title);
        }
        return categories;
    }

    getCategory (category: number): Category {
        return this.round.categories[category];
    }

    getClue (category: number, row: number): Clue {
        return this.round.categories[category].clues[row];
    }

    // getClueValue (category: number, row: number): number {
    //     return this.round.categories[category].clues[row].value;
    // }
    //
    // getClueStatus (category: number, row: number): string {
    //     return this.round.categories[category].clues[row].status;
    // }

    setClueStatus (category: number, row: number, status: string) {
        this.round.categories[category].clues[row].status = status;
    }

    logClue (clue: Clue) {
        const now = new Date();
        this.log.push({clue, timestamp: [now.getHours(), now.getMinutes(), now.getSeconds()]});
    }

    unlogClue (clue: Clue) {
        const index = this.log.findIndex((item: any) => item.clue === clue);
        if (index !== -1) {
            this.log.splice(index, 1);
        }
    }

    recalcScore() {
        this.score = 0;
        for (const key in this.rounds) {
            const round = this.rounds[key];
            for (const category of round.categories) {
                for (const clue of category.clues) {
                    if (clue.status === 'right') {
                        this.score += clue.value;
                    } else if (clue.status === 'wrong' && !clue.dd) {
                        this.score -= clue.value;
                    }
                }
            }
        }
    }

}
