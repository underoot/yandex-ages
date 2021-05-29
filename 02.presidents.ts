import cheerio from 'cheerio';
import { writeFileSync } from 'fs';
import got from 'got';

const countries = require('./countries.json');

(async () => {
    const countriesWithPresident = [];

    for (let [link, name] of countries) {
        const {rawBody} = await got(`https://ru.wikipedia.org${link}`);
        const $ = cheerio.load(rawBody.toString());

        if ($('th:contains("президент")').length) {
            countriesWithPresident.push(name);
        }
        if ($('th:contains("Президент")').length) {
            countriesWithPresident.push(name);
        }
    }

    writeFileSync('countries-with-president.json', JSON.stringify(countriesWithPresident, null, '\t'));
})();
