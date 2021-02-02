export class Clue {
    constructor (public value: number, public dd: boolean, public ts: boolean,
                 public prompt: string, public response: string, public media: string[]) {
    }
}

export class Category {
    constructor (public title: string, public clues: (Clue | null)[]) { }
}

export class Round {
    constructor (public label: string, public categories: Category[]) { }
}

export class Match {
    constructor (public airdate: string, public coyrats: object, public rounds: Round[]) { }

    getClue (round: number, category: number, clue: number): Clue {
        return this.rounds[round].categories[category].clues[clue];
    }
}
