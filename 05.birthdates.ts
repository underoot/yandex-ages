import Cheerio from "cheerio";
import { writeFileSync } from "fs";
import got from "got/dist/source";

const forms = require('./forms.json');

(async () => {
    const data = [];
    const unfound = [];
    for (const [country, countryForm] of forms as Array<[string, string]>) {
        let mainBody: string = '';
        const mainUrl = `https://ru.wikipedia.org/wiki/${encodeURIComponent('Президент_' + countryForm)}`;
        try {
            mainBody = (await got(mainUrl)).rawBody.toString();
        } catch (e) {
            console.error(`Не могу найти статью про президента ${country}`, e);
            unfound.push(country);
            writeFileSync('unfound-birthdates.json', JSON.stringify(unfound, null, '\t'));
            continue;
        }

        const $ = Cheerio.load(mainBody);
        const curLink = $('b:contains("Должность занимает")').parent().find('span.no-wikidata a').attr('href');

        if (!curLink) {
            console.error(`Не могу найти найти ссылку на президента ${countryForm}`);
            unfound.push(country);
            writeFileSync('unfound-birthdates.json', JSON.stringify(unfound, null, '\t'));
            continue;
        }

        const presBody = (await got(`https://ru.wikipedia.org/${curLink}`)).rawBody;
        const $pres = Cheerio.load(presBody);
        const match = $pres('th:contains("Рождение")').parent().text().match(/\((\d+)\s*(?:год|лет)/);

        if (!match) {
            console.error(`Не смог найти президентский возраст страны ${country}`);
            unfound.push(country);
            writeFileSync('unfound-birthdates.json', JSON.stringify(unfound, null, '\t'));
            continue;
        }

        const [_, value] = match;

        data.push([countryForm, value]);
        console.log(`Президенту ${countryForm}: ${value}`);
        writeFileSync('birthdates.json', JSON.stringify(data, null, '\t'));
    }

})();
