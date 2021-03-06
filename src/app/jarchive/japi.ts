const axios = require('axios').default;
const cheerio = require('cheerio');
const dateformat = require('dateformat');

import {Match, Round, Category, Clue} from "./models";

const jarchive_url = 'https://j-archive.com/';

const _toggle_re = /toggle\('[A-Za-z0-9_]+'\s*,\s*'[A-Za-z0-9_]+'\s*,\s*'(.+)'\s*\)/;
const _gameid_re = /game_id=(\d+)/;
const _date_re = /\d+\s*,\s*aired\s+(\d\d\d\d-\d\d\-\d\d)/;

export class JAPI {
    constructor (public baseurl = jarchive_url) { }

    async getMatchByDate (date): Promise<Match> {
        const response = await axios.get(`${this.baseurl}search.php?search=date:${date}`);
        const $ = cheerio.load(response.data);
        return this._parsePage($);
        // for (const tr of $('tr')) {
        //     const a = $('a', tr);
        //     if ($(a).text().trim().match(_date_re)[1] === date) {
        //         const jid = $(a).attr('href').match(_gameid_re)[1];
        //         return this.getMatchById(jid);
        //     }
        // }
        // throw 'Not Found';
    }

    async getMatchById (jid): Promise<Match> {
        const response = await axios.get(`${this.baseurl}showgame.php?game_id=${jid}`);
        const $ = cheerio.load(response.data);
        return this._parsePage($);
    }

    async _parsePage ($): Promise<Match> {
        const title = $('#game_title h1').text();
        const airdate = dateformat(new Date(title.split(/\s*-\s*/)[1]), 'yyyy-mm-dd');
        const coryats = this ._parseCoryats($);
        const round_query = $('.round');
        const rounds = [this._parseRound($, round_query[0], 'Jeopardy', 200),
            this._parseRound($, round_query[1], 'Double Jeopardy', 400)];
        return new Match(airdate, coryats, rounds); // FIXME
    }

    _parseCoryats ($): object {
        const coryats = {'combined': 0};
        const names = [];
        const scores = [];
        let context = $('a[href="https://www.j-archive.com/help.php#coryatscore"]')[0].parent;
        while (context.type !== 'tag' || context.name !== 'table') {
            context = context.next;
        }
        const trs = $('tr', context);
        for (const td of $('td', trs[0])) {
            names.push($(td).text());
        }
        for (const td of $('td', trs[1])) {
            scores.push(parseInt($(td).text().trim().replace(/[$,]/g, '')));
        }
        for (let i = 0; i < names.length; i++) {
            coryats[names[i]] = scores[i];
            coryats['combined'] += scores[i];
        }
        return coryats;
    }

    _parseRound ($, context, label, clue_inc): Round {
        const categories = [];
        for (const category of $('.category_name', context)) {
            categories.push({name: $(category).text(), clues: []});
        }
        let count = 0;
        for (const clue of $('.clue', context)) {
            if ($(clue).text().trim().length === 0) {
                categories[count % 6].clues.push(null);
            } else {
                categories[count % 6].clues.push(this._parseClue($, clue, clue_inc * Math.ceil(count / 6)));
            }
            count++;
        }
        for (let i = 0; i < categories.length; i++) {
            categories[i] = new Category(categories[i].name, categories[i].clues);
        }
        return new Round(label, categories);
    }

    _parseClue ($, context, value): Clue {
        //const value = $('.clue_value, .clue_value_daily_double', context).text().trim();
        const dd = ($('.clue_value_daily_double', context).length !== 0);
        const clue = $('.clue_text', context);
        let media = [];
        for (const a of $('a', clue)) {
            media.push($(a).attr('href'));
        }
        const onmouseover = $('div[onmouseover]', context).attr('onmouseover').trim();
        const $result = cheerio.load(onmouseover.match(_toggle_re)[1]);
        const wrong = $result('.wrong').last();
        const ts =(wrong.length !== 0 && wrong.text().trim() === 'Triple Stumper');
        return new Clue(value, dd, ts, clue.text(), $result('.correct_response').text(), media);
    }
}
