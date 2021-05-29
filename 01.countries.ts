import cheerio from 'cheerio';
import { writeFileSync } from 'fs';
import got from 'got';

(async () => {
    const {rawBody} = await got('https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B8%D1%81%D0%BE%D0%BA_%D0%B3%D0%BE%D1%81%D1%83%D0%B4%D0%B0%D1%80%D1%81%D1%82%D0%B2')

    const $ = cheerio.load(rawBody.toString());

    const rows = $('td > a', '.wikitable').toArray().map(e => {
        return [$(e).attr('href'), $(e).text()];
    });

    writeFileSync('countries.json', JSON.stringify(rows, null, '\t'));
})();
