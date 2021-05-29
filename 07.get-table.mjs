import {markdownTable} from 'markdown-table';
import {writeFileSync} from 'fs';

import results from './results.json';

results.sort((l, r) => {
    return l.countryName.localeCompare(r.countryName);
})

const result = markdownTable([
    ['Страна', 'Согласно русской Википедии', 'Yandex', 'Google'],
    ...results.map(result => ([
        result.countryName,
        /^\d+$/.test(result.wikiAnswer) ? result.wikiAnswer : '—<a href="#wiki_remark"><sup>*</sup></a>',
        /^\d+$/.test(result.yandexAnswer) ? result.yandexAnswer : '—<a href="#serp_remark"><sup>*</sup></a>',
        /^\d+$/.test(result.googleAnswer) ? result.googleAnswer : '—<a href="#serp_remark"><sup>*</sup></a>'
    ]))
]);

writeFileSync('table.md', result);
