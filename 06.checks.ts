import {chromium} from 'playwright';
import {writeFile, mkdir} from 'fs/promises';


const birthDates = require('./birthdates.json');
const forms = require('./forms.json');

(async () => {
    const browser = await chromium.launch({
        headless: false
    });

    const yandexPage = await browser.newPage();
    const googlePage = await browser.newPage();

    await yandexPage.goto('https://yandex.ru/search?text=Simple');

    await new Promise(r => setTimeout(r, 20000));

    const results = [];

    try { await mkdir('screenshots'); } catch {}

    for (const [countryForm, value] of birthDates) {
        const request = encodeURIComponent(`Сколько лет президенту ${countryForm}`);
        const yandexUrl = `https://yandex.ru/search?text=${request}`;
        const googleUrl = `https://google.com/search?q=${request}`;

        await Promise.all([
            yandexPage.goto(yandexUrl),
            googlePage.goto(googleUrl)
        ]);

        try {
            await googlePage.click('button :text("I agree")', { timeout: 200 });
        } catch {
            // Do nothing
        }

        const googleScreenshot = await googlePage.screenshot();
        const yandexScreenshot = await yandexPage.screenshot();

        let countryName = '';

        try {
            countryName = forms.find(([_, form]: [string, string]) => form === countryForm)[0];
        } catch {
            console.warn('Проблема с формой страны ', countryForm);
        }

        console.log(countryName);

        await writeFile(`screenshots/${countryName}_google.png`, googleScreenshot);
        await writeFile(`screenshots/${countryName}_yandex.png`, yandexScreenshot);

        console.log('Записаны скриншоты');

        let googleAnswer = '—';
        let yandexAnswer = '—';

        try {
            googleAnswer = (await googlePage.innerText('*[data-attrid="kc:/people/person:age"][aria-level] > div:first-child', {timeout: 200})).replace(/[^\d]+/, '');
        } catch {
            console.warn(`Google не дает точного ответа`);
        }

        try {
            yandexAnswer = (await yandexPage.innerText('.Fact-Answer, .fact__answer', {timeout: 200})).replace(/[^\d]+/, '');
        } catch {
            console.warn(`Yandex не дает точного ответа`);
        }

        results.push({
            countryName,
            yandexAnswer,
            googleAnswer,
            wikiAnswer: value
        });

        await writeFile('results.json', JSON.stringify(results, null, '\t'));
    }
})();
