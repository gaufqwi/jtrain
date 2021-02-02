export enum ClueStatus {
    Unseen,
    Passed,
    Right,
    Wrong,
    Lucky
}

export enum RoundType {
    Jeopardy,
    DoubleJeopardy
}

interface Category {
    name: string,
    clues: ClueStatus[];
}

export class GameState {
    rounds: Array<Array<Category>> = [];
    coryat: number = 0;
    currentRound: RoundType = RoundType.Jeopardy;
    currentValue: number = 200;
    private values: Array<number> = [200, 400];
    constructor () {
        //this.rounds = [];
        for (const round of [RoundType.Jeopardy, RoundType.DoubleJeopardy]) {
            this.rounds[round] = [];
            for (let i = 0; i < 6; i++) {
                this.rounds[round].push({name: `Category ${i+1}`,
                    clues: [ClueStatus.Unseen, ClueStatus.Unseen, ClueStatus.Unseen, ClueStatus.Unseen, ClueStatus.Unseen]});
            }
        }
    }

    labelCategories (round: RoundType, labels: string[]) {
        for (let i = 0; i < 6; i++) {
            this.rounds[round][i].name = labels[i];
        }
    }

    setCurrentRound (round: RoundType) {
        this.currentRound = round;
        this.currentValue = this.values[round];
    }

    getCategories (): string[] {
        const categories = [];
        for (const category of this.rounds[this.currentRound]) {
            categories.push(category.name);
        }
        return categories;
    }

    getClueValue (row: number): number {
        return (row + 1) * this.currentValue;
    }

    getClueStatus (category: number, row: number) {
        return this.rounds[this.currentRound][category].clues[row];
    }

    setClueStatus (category: number, row: number, status: ClueStatus) {
        const oldstatus = this.rounds[this.currentRound][category].clues[row];
        this.rounds[this.currentRound][category].clues[row] = status;
        switch (oldstatus) {
            case ClueStatus.Unseen:
            case ClueStatus.Passed:
                if (status === ClueStatus.Right || status === ClueStatus.Lucky) {
                    this.coryat += this.currentValue * (row + 1);
                } else if (status === ClueStatus.Wrong) {
                    this.coryat -= this.currentValue * (row + 1);
                }
                break;
            case ClueStatus.Right:
            case ClueStatus.Lucky:
                if (status === ClueStatus.Unseen || status === ClueStatus.Passed) {
                    this.coryat -= this.currentValue * (row + 1);
                } else if (status === ClueStatus.Wrong) {
                    this.coryat -= 2 * this.currentValue * (row + 1);
                }
                break;
            case ClueStatus.Wrong:
                if (status === ClueStatus.Unseen || status === ClueStatus.Passed) {
                    this.coryat += this.currentValue * (row + 1);
                } else if (status === ClueStatus.Right || ClueStatus.Lucky) {
                    this.coryat += 2 * this.currentValue * (row + 1);
                }
                break;
        }
        // Emit event?
    }
}
