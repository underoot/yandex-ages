import Cheerio from 'cheerio';
import {writeFileSync} from 'fs';
import got from 'got';

const countries = require('./some-countries.json');

const MAIN_URL = 'ru.wiktionary.org/wiki/';

(async () => {
    const found = [];
    const unfound = [];

    for (const country of countries) {
        let body = null;
        try {
            body = (await got(`https://${MAIN_URL}${encodeURIComponent(country)}`)).rawBody;
            const $ = Cheerio.load(body);
            const value = $('a[title="родительный"]').parent().next().text();

            if (!value) {
                unfound.push(country);
                continue;
            }
            found.push([country, value.normalize("NFD").replace(/[\u0300-\u0305]|[\u0307-\u036f]/g, "").split('\n')[0]]);
            writeFileSync('forms.json', JSON.stringify(found, null, '\t'));
        } catch (e) {
            console.warn(`Для ${country} не найдено слова в словаре`, e);
            unfound.push(country);
        }

        writeFileSync('unfound-forms.json', JSON.stringify(unfound, null, '\t'));
    }
})();
