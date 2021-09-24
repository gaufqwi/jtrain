const axios = require('axios').default;
const cheerio = require('cheerio');
const dateformat = require('dateformat');

//import {Match, Round, Category, Clue} from "./models";

const jarchive_url = 'https://j-archive.com/';

const _toggle_re = /toggle\('[A-Za-z0-9_]+'\s*,\s*'[A-Za-z0-9_]+'\s*,\s*'(.+)'\s*\)/;
const _gameid_re = /game_id=(\d+)/;
const _date_re = /\d+\s*,\s*aired\s+(\d\d\d\d-\d\d\-\d\d)/;

class JAPI {
    constructor (baseurl = jarchive_url) {
        this.baseurl = baseurl;
    }

    async getMatchByDate (date) {
        const response = await axios.get(`${this.baseurl}search.php?search=date:${date}`);
        const $ = cheerio.load(response.data);
        return this._parseGame($);
        // for (const tr of $('tr')) {
        //     const a = $('a', tr);
        //     if ($(a).text().trim().match(_date_re)[1] === date) {
        //         const jid = $(a).attr('href').match(_gameid_re)[1];
        //         return this.getMatchById(jid);
        //     }
        // }
        // throw 'Not Found';
    }

    async getMatchById (jid) {
        console.log('getbyid');
        const response = await axios.get(`${this.baseurl}showgame.php?game_id=${jid}`);
        const $ = cheerio.load(response.data);
        return this._parseGame($);
    }

    async _parseGame ($) {
        const title = $('#game_title h1').text();
        console.log('title', title);
        const airdate = dateformat(new Date(title.split(/\s*-\s*/)[1]), 'yyyy-mm-dd');
        const coryats = this ._parseCoryats($);
        const round_query = $('.round');
        const rounds = {'Jeopardy': this._parseRound($, round_query[0], 'Jeopardy', 200),
            'Double Jeopardy': this._parseRound($, round_query[1], 'Double Jeopardy', 400),
            'Final Jeopardy': this._parseFinal($)
        };
        //console.log(JSON.stringify(rounds, null, 2)); //FIXME
        return {airdate, coryats, rounds};
    }

    _parseFinal ($) {
        //const category = $('.final_round .category_name').text();
        //const clue = $('#clue_FJ').text();
        const onmouseover = $('.final_round div[onmouseover]').attr('onmouseover').trim().replace(/\\"/g, '"');
        const $result = cheerio.load(onmouseover.match(_toggle_re)[1]);
        //const correct = $result('.correct_response').text();
        return {
            label: 'Final Jeopardy',
            categories: [{
                title: $('.final_round .category_name').text(),
                clues: [{
                    value: 0,
                    dd: false,
                    ts: false,
                    clue: $('#clue_FJ').text(),
                    correct: $result('.correct_response').text(),
                    media: []
                }]
            }]
        }
        // return {
        //     category: $('.final_round .category_name').text(),
        //     clue: $('#clue_FJ').text(),
        //     correct: $result('.correct_response').text()
        // };
    }

    _parseCoryats ($) {
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

    _parseRound ($, context, label, clue_inc) {
        const categories = [];
        for (const category of $('.category_name', context)) {
            categories.push({name: $(category).text(), clues: []});
        }
        let count = 0;
        for (const clue of $('.clue', context)) {
            if ($(clue).text().trim().length === 0) {
                categories[count % 6].clues.push(null);
            } else {
                categories[count % 6].clues.push(
                    this._parseClue($, clue, clue_inc * (Math.floor(count / 6) + 1)));
            }
            count++;
        }
        for (let i = 0; i < categories.length; i++) {
            categories[i] = {title: categories[i].name, clues: categories[i].clues};
        }
        return {label, categories};
    }

    _parseClue ($, context, value) {
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
        const ts = (wrong.length !== 0 && wrong.text().trim() === 'Triple Stumper');
        return {value, dd, ts, clue: clue.text(), correct: $result('.correct_response').text(), media}
    }
}

module.exports = JAPI;
