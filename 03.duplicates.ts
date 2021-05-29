import {writeFileSync} from 'fs';
const original = require('./countries-with-president.json');

const set = new Set(original);

writeFileSync('some-countries.json', JSON.stringify([...set.values()], null, '\t'));
