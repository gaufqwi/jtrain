import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable} from "rxjs";
import {map, catchError, retry} from "rxjs/operators";
import {throwError} from "rxjs";

const gameFilter = game => new Game(game as GameInterface);
const logGame = game => {console.log(game); return game};

@Injectable({
  providedIn: 'root'
})
export class JArchiveService {
  private server = '';
  private port = 4200;

  constructor(private http: HttpClient) { }

    handleError (error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', error.error.message);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(`Backend returned code ${error.status}, body was: ${error.error}`);
        }
        // Return an observable with a user-facing error message.
        return throwError('Error with network request');
    }

  testAPI () {
    this.http.get(`/api/test`).subscribe(data => console.log('Response', data));
  }

  getNewGame (): Game {
      return new Game();
  }

  postGameData (date, stats, clues): Observable<any> {
      return this.http.post('/api/gamedata', {date, stats, clues}).pipe(
          catchError(this.handleError)
      )
  }

  getGameById (jid: number): Observable<Game> {
      return this.http.get(`/api/jbyid/${jid}`).pipe(
          retry(3),
          map(gameFilter),
          catchError(this.handleError)
      );
  }

  getGameByDate (date: string): Observable<Game> {
      return this.http.get(`/api/jbydate/${date}`).pipe(
          //retry(3),
          //map(logGame),
          map(gameFilter),
          //catchError(this.handleError)
      );
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
            if (position) {
                this.title = `Category ${position}`;
                for (let i = 1; i <= 5; i++) {
                    this.clues.push(new Clue(i * increment));
                }
            } else {
                this.title = 'Final Jeopardy';
                this.clues.push(new Clue(0));
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
            if (clue) {
                clue.category = this;
            }
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
            if (increment) {
                for (let i = 1; i <= 6; i++) {
                    this.categories.push(new Category(i, increment));
                }
            } else {
                this.categories.push(new Category(0, 0));
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

interface LogItem {
    clue: Clue;
    save: boolean;
}

export class Game {
    public airdate: string;
    public coryats: object = {};
    public rounds: object = {};
    public score: number = 0;

    private round: Round;
    public log: LogItem[] = [];

    constructor (game: GameInterface = null) {
        if (game) {
            for (const round of ['Jeopardy', 'Double Jeopardy', 'Final Jeopardy']) {
                game.rounds[round] = new Round(game.rounds[round]);
            }
            //console.log(game.rounds['Final Jeopardy']);
            Object.assign(this, game);
        } else {
            const now = new Date();
            this.airdate = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
            this.rounds['Jeopardy'] = new Round('Jeopardy', 200);
            this.rounds['Double Jeopardy'] = new Round('Double Jeopardy', 400);
            this.rounds['Final Jeopardy'] = new Round('Final Jeopardy', 0);
        }
        for (const round of ['Jeopardy', 'Double Jeopardy']) {
            this.rounds[round].game = this;
        }
        this.round = this.rounds['Jeopardy'];
    }

    setRound (label: string) {
        this.round = this.rounds[label];
    }

    isFJ (): boolean {
        return (this.round.label === 'Final Jeopardy');
    }

    getFinalCategory (): string {
        return this.rounds['Final Jeopardy'].categories[0].title;
    }

    getCategories (): string[] {
        const categories = [];
        for (const category of this.round.categories) {
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
        this.log.push({clue, save: (clue.status === 'wrong' || clue.status === 'passed')});
    }

    unlogClue (clue: Clue) {
        const index = this.log.findIndex((item: LogItem) => item.clue === clue);
        if (index !== -1) {
            this.log.splice(index, 1);
        }
    }

    recalcScore () {
        this.score = 0;
        for (const name of ['Jeopardy', 'Double Jeopardy']) {
            const round = this.rounds[name];
            for (const category of round.categories) {
                for (const clue of category.clues) {
                    if (!clue) {
                        continue;
                    }
                    if (clue.status === 'right') {
                        this.score += clue.value;
                    } else if (clue.status === 'wrong' && !clue.dd) {
                        this.score -= clue.value;
                    }
                }
            }
        }
    }

    getRoundIterable (): Round[] {
        const rounds = [];
        for (const key in this.rounds) {
            rounds.push({label: key, round: this.rounds[key]});
        }
        return rounds;
    }

    // getFormattedScore (): string {
    //     return `${this.score < 0 ? '-$' : '$'}${Math.abs(this.score)}`
    // }

    getSummary (): object {
        const score = {'Jeopardy': 0, 'Double Jeopardy': 0};
        const clueRightCount = {'Jeopardy': 0, 'Double Jeopardy': 0};
        const clueWrongCount = {'Jeopardy': 0, 'Double Jeopardy': 0};
        const categoryCounts = {'Jeopardy': {}, 'Double Jeopardy': {}};
        const bottomRowClues = {'Jeopardy': [], 'Double Jeopardy': []};
        const runs = {'Jeopardy': [], 'Double Jeopardy': []};
        //const antiRuns = {'Jeopardy': [], 'Double Jeopardy': []};
        const lt = {'Jeopardy': [], 'Double Jeopardy': []};
        const ltTotal = {'Jeopardy': 0, 'Double Jeopardy': 0};
        const ddRight = {'Jeopardy': 0, 'Double Jeopardy': 0};
        const ddTotal = {'Jeopardy': 0, 'Double Jeopardy': 0};
        for (const round of ['Jeopardy', 'Double Jeopardy']) {
            for (const category of this.rounds[round].categories) {
                categoryCounts[round][category.title] = 0;
            }
        }
        let fjCorrect = false;
        for (const item of this.log) {
            const clue = item.clue;
            const category = clue.category.title;
            const round = clue.category.round.label;
            if (round === 'Final Jeopardy') {
                fjCorrect = (clue.status === 'right');
            } else if (clue.status === 'right') {
                clueRightCount[round] += 1;
                score[round] += clue.value;
                categoryCounts[round][category] += 1;
                if (clue.dd) {
                    ddRight[round] += 1;
                }
                if (clue.ts) {
                    lt[round].push(clue.correct);
                    ltTotal[round] += clue.value;
                }
                if ((round === 'Jeopardy' && clue.value === 1000) ||
                    (round === 'Double Jeopardy' && clue.value === 2000)) {
                    bottomRowClues[round].push(category);
                }
            } else if (clue.status === 'wrong') {
                clueWrongCount[round] += 1;
                if (!clue.dd) {
                    score[round] -= clue.value;
                }
            }
            if (clue.dd) {
                ddTotal[round] += 1;
            }
        }
        for (const round of ['Jeopardy', 'Double Jeopardy']) {
            for (const category in categoryCounts[round]) {
                if (categoryCounts[round][category] === 5) {
                    runs[round].push(category);
                }
                // else if (categoryCounts[round][category] === 0) {
                //     antiRuns[round].push(category);
                // }
            }
        }
        //return sample;
        return {score, clueRightCount, clueWrongCount, runs, bottomRowClues,
             lt, ltTotal, ddRight, ddTotal, fjCorrect, coryats: this.coryats};
    }
}

let sample = {
    "score": {
        "Jeopardy": 8600,
        "Double Jeopardy": 21200
    },
    "bottomRowClues": {
        "Jeopardy": [
            "THE 20th CENTURY", "SOME OTHER CLUE", "18TH CENTURY OPERA", "MATH"
        ],
        "Double Jeopardy": [
            //"THE 1971 EMMY AWARDS", "FAKE NEWS", "RHYME TIME"
        ]
    },
    "clueRightCount": {
        "Jeopardy": 18,
        "Double Jeopardy": 20
    },
    "clueWrongCount": {
        "Jeopardy": 3,
        "Double Jeopardy": 4
    },
    "runs": {
        "Jeopardy": [
            "THE 20th CENTURY"
        ],
        "Double Jeopardy": [
            "THE 1971 EMMY AWARDS"
        ]
    },
    "antiRuns": {
        "Jeopardy": [
            "NATIONAL GEOGRAPHIC AMERICA THE BEAUTIFUL"
        ],
        "Double Jeopardy": []
    },
    "lt": {
        "Jeopardy": [
            "Russia",
            "Animal Crossing",
            "dinkum"
        ],
        "Double Jeopardy": [
            "Valerie Harper",
            "the tibia",
            "The Snow Queen",
            "Norway",
            "homonym",
            "a Cyclops"
        ]
    },
    "ltTotal": {
        "Jeopardy": 1800,
        "Double Jeopardy": 10400
    },
    "ddRight": {
        "Jeopardy": 1,
        "Double Jeopardy": 1
    },
    "ddTotal": {
        "Jeopardy": 1,
        "Double Jeopardy": 2
    },
    "coryats": {
        "combined": 25000,
        "Peter": 12200,
        "Paul": 9800,
        "Mary": 3000
    }
};
