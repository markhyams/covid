/* eslint-disable no-unused-expressions */
/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
const fs = require('fs');

function getStateData() {
  const result = {};

  const parseStateLine = (line) => {
    let pop;
    let state;

    [pop, , state] = line.split(/"(,)/);

    pop = Number(pop.replace(/,|"/g, ''));
    state = state.replace(',', '');

    result[state] = pop;
  };

  let data = fs.readFileSync('statesPop.csv', 'utf-8');

  data = data.split('\r\n');

  data.forEach((line) => {
    line ? parseStateLine(line) : null;
  });

  return result;
}

{
  AL: 4903185,
  AK: 3017804,
  AZ: 7278717,
  CA: 39512223,
  CO: 5758736,
  CT: 3565287,
  DE: 973764,
  DC: 705749,
  FL: 21477737,
  GA: 10617423,
  HI: 1415872,
  ID: 1787065,
  IL: 12671821,
  IN: 6732219,
  IA: 3155070,
  KS: 2913314,
  KY: 4467673,
  LA: 4648794,
  ME: 1344212,
  MD: 6045680,
  MA: 6892503,
  MI: 9986857,
  MN: 5639632,
  MS: 2976149,
  MO: 6137428,
  MT: 1068778,
  NE: 1934408,
  NV: 3080156,
  NH: 1359711,
  NJ: 8882190,
  NM: 2096829,
  NY: 19453561,
  NC: 10488084,
  ND: 762062,
  OH: 11689100,
  OK: 3956971,
  OR: 4217737,
  PN: 12801989,
  PA: 1059361,
  SC: 5148714,
  SD: 884659,
  TN: 6829174,
  TX: 28995881,
  UT: 3205958,
  VT: 623989,
  VA: 8535519,
  WA: 7614893,
  WV: 1792147,
  WI: 5822434,
  WY: 578759
}