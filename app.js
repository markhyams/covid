const Api = (function makeApi() {
  function status(response) {
    if (response.status >= 200 && response.status < 300) {
      return Promise.resolve(response);
    }

    response.text()
      .then((txt) => {
        alert(`Server says: ${txt}`);
      });
    return Promise.reject(new Error(response.statusText));
  }

  function text(response) {
    return response.text();
  }

  function json(response) {
    return response.json();
  }

  function fetchJSON({ url, initObj, callback }) {
    fetch(url, initObj)
      .then(status)
      .then(json)
      .then(callback)
      .catch((err) => {
        console.log('Fetch Error! ', err);
      });
  }

  const baseUrl = 'https://covidtracking.com/api/';

  return {
    getAll(callback) {
      const url = `${baseUrl}v1/states/current.json`;
      fetchJSON({ url, callback });
    },

    get(id, callback) {
      const url = `${baseUrl}/${id}`;
      fetchJSON({ url, callback });
    },

    create(data, callback) {
      const initObj = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const url = baseUrl;

      fetchJSON({ url, initObj, callback });
    },

    update(data, callback) {
      const initObj = {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const url = `${baseUrl}/${data.id}`;

      fetchJSON({ url, initObj, callback });
    },

    delete(id, callback) {
      const url = `${baseUrl}/${id}`;
      const initObj = {
        method: 'DELETE',
      };

      fetch(url, initObj)
        .then(status)
        .then(text)
        .then(callback)
        .catch((err) => {
          console.log('Fetch Error! ', err);
        });
    },
  };
}());

const Templates = {
  htmlStringFrom(templateId) {
    const html = document.getElementById(templateId);
    if (!html) { return ''; }

    return html.innerHTML.trim();
  },

  init() {
    const templates = [...document.querySelectorAll('[type="text/x-handlebars"]')];
    templates.forEach((elem) => {
      this[elem.id] = Handlebars.compile(this.htmlStringFrom(elem.id));
    });

    const partials = [...document.querySelectorAll('[data-type="partial"]')];
    partials.forEach((partial) => {
      const { id } = partial;
      Handlebars.registerPartial(id, this.htmlStringFrom(id));
    });
  },
};

const Data = {
  statePop: {
    AL: 4903185,
    AR: 3017804,
    AK: 731545,
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
    PA: 12801989,
    RI: 1059361,
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
    WY: 578759,
  },

  parse(data) {
    return data.map(({
      state,
      positive,
      negative,
      totalTestResults,
    }) => ({
      state,
      positive,
      negative,
      totalTestResults,
    }));
  },

};

const Chart = (function makeChart() {
  return {
    init(stateObjects) {
      function drawChart() {
        // const formatData = (data) => {
        //   const result = [['Percent Negative', 'Tests per-capita']];
        //   data.forEach((stateObj) => {
        //     result.push([stateObj.percentNegative, stateObj.testsPer1000]);
        //   });
        //   return result;
        // };

        const createDataTable = (data) => {
          const dataTable = new google.visualization.DataTable();
          const rowsToAdd = [];
          dataTable.addColumn('number', 'Percent Negative');
          dataTable.addColumn('number', 'Tests per capita');
          // A column for custom tooltip content
          dataTable.addColumn({ type: 'string', role: 'tooltip' });


          data.forEach((stateObj) => {
            const toolTip = `State: ${stateObj.state}
                             Population: ${stateObj.population}
                             Total Cases: ${stateObj.positive.toLocaleString()}
                             Negative Tests: ${stateObj.percentNegative}%`;
            rowsToAdd.push([stateObj.percentNegative, stateObj.testsPer1000, toolTip]);
          });

          dataTable.addRows(rowsToAdd);
          return dataTable;
        };

        // const data = google.visualization.arrayToDataTable(formatData(stateObjects));
        const data = createDataTable(stateObjects);
        const options = {
          title: 'Percent Negative vs. Tests per-capita comparison',
          hAxis: { title: 'Percent Negative', minValue: 50, maxValue: 100 },
          vAxis: { title: 'Tests per 100k people', minValue: 0, maxValue: 2000 },
          legend: 'none',
        };

        const chart = new google.visualization.ScatterChart(document.getElementById('scatter_chart'));

        chart.draw(data, options);
      }

      google.charts.load('current', { 'packages':['corechart'] });
      google.charts.setOnLoadCallback(drawChart);


    },
  }
}());

const App = (function makeApp() {
  const start = (data) => {
    let states = Data.parse(data);
    states = states.filter((state) => Data.statePop[state.state]);

    states.map((state) => {
      state.population = Data.statePop[state.state];
      state.percentNegative = Math.round(1000 * state.negative / state.totalTestResults) / 10;
      state.testsPer1000 = Math.round(100000 * state.totalTestResults / state.population);
      state.population = state.population.toLocaleString();
      return state;
    });

    states.sort((a, b) => {
      return b.testsPer1000 - a.testsPer1000;
    });

    const html = Templates.states_table_template({ states: states });
    const tbody = document.querySelector('#states_table tbody');
    tbody.innerHTML = html;
    // console.log(states);

    Chart.init(states);
  };

  return {
    init() {
      Templates.init();
      Api.getAll(start);
    },
  };
}());

document.addEventListener('DOMContentLoaded', App.init.bind(App));
