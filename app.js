const URL = "https://pomber.github.io/covid19/timeseries.json";

const localPopulationURL =
  "https://raw.githubusercontent.com/freethrow/covid19/master/wp.json";

let populationDict = {};

// color palette
// let palette = ["#ffa600", "#ff6361", "#bc5090", "#003f5c", "#58508d"];

let palette = [
  "#ffa600",
  "#f95d6a",
  "#2f4b7c",
  "#ff7c43",
  "#d45087",
  "#a05195",
  "#003f5c",
  "#f95d6a",
];

let chart;

let metric = "confirmed";
let countries = ["Russia", "China", "Italy", "Germany", "Spain"];

const metricSelector = document.getElementById("metric");

let countrySelector;

metricSelector.addEventListener("change", (event) => {
  metric = event.target.value;
  chart.destroy();
  drawChart(countries, metric);
});

// check localstorage if there is the dataDate var
// and if it is fresh enough: less than 6 hours
function checkOldData() {
  // get the dataDate
  let dataDate = window.localStorage.getItem("dataDate");

  if (dataDate == null) {
    return true;
  } else {
    let now = new Date();
    let lsDate = new Date(dataDate * 1000);
    console.log("Time in local storage is:", lsDate);
    let diff = Math.round((now - lsDate) / 1000);
    console.log(`Difference is ${diff} seconds...`);
    if (diff > 20) {
      console.log("Data is old, fetch again...");
      return true;
    }
    console.log("All is ok, data is fresh.");
    return false;
  }
}

const drawChart = (countries, metric) => {
  // getting data
  const fullData = JSON.parse(localStorage.getItem("countryData"));

  countryDatasets = [];
  let xlabels = [];
  countries.forEach((country, index) => {
    if (index == 0) {
      fullData[country].forEach((el) => {
        xlabels.push(el.date);
      });
    }

    let dataObject = {};
    dataObject["label"] = country;

    const countryData = fullData[country];

    // create data points for metric
    let dataPoints = [];
    countryData.forEach((el) => {
      if (metric == "deaths/confirmed") {
        dataPoints.push(el["deaths"] / el["confirmed"]);
      } else if (metric == "confirmed/100K") {
        dataPoints.push((100000 * el["confirmed"]) / populationDict[country]);
      } else if (metric == "deaths/100K") {
        dataPoints.push((100000 * el["deaths"]) / populationDict[country]);
      } else {
        dataPoints.push(el[metric]);
      }
    });
    dataObject["data"] = dataPoints;
    dataObject["backgroundColor"] = palette[index];
    dataObject["fill"] = false;
    dataObject["borderColor"] = palette[index];
    dataObject["pointRadius"] = 3;
    dataObject["pointHoverRadius"] = 10;

    countryDatasets.push(dataObject);
  });

  // parametrize the id?
  const ctx = document.getElementById("chart1").getContext("2d");

  //console.log("XLABELS:", xlabels);
  const myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xlabels,
      datasets: countryDatasets,
    },
    options: {
      title: {
        display: true,
        text: `Number of ${metric}`,
        fontFamily: "Open Sans",
        fontSize: 34,
        fontWeigth: 100,
        position: "left",
      },
      tooltips: {
        enabled: true,
      },

      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
        xAxes: [
          {
            type: "time",
            time: {
              unit: "day",
            },
          },
        ],
      },
    },
  });
  chart = myChart;
};

const createSelector = () => {
  const fullData = JSON.parse(localStorage.getItem("countryData"));
  let countryOptions = [];

  for (let key in fullData) {
    let d = {};
    d["label"] = key;
    d["value"] = key;
    countryOptions.push(d);
  }

  const instance = new SelectPure("#countrySelect", {
    options: countryOptions,
    multiple: true,
    placeholder: false,

    autocomplete: true,
    value: countries,
    icon: "fa fa-times",
    onChange: (value) => {
      countries = value;
      chart.destroy();
      drawChart(value, metric);
    },
    classNames: {
      select: "select-pure__select",
      dropdownShown: "select-pure__select--opened",
      multiselect: "select-pure__select--multiple",
      label: "select-pure__label",
      placeholder: "select-pure__placeholder",
      dropdown: "select-pure__options",
      option: "select-pure__option",
      autocompleteInput: "select-pure__autocomplete",
      selectedLabel: "select-pure__selected-label",
      selectedOption: "select-pure__option--selected",
      placeholderHidden: "select-pure__placeholder--hidden",
      optionHidden: "select-pure__option--hidden",
    },
  });
  countrySelector = instance;
};

// create a dictionary country:population
const populateDict = () => {
  const lsPopData = JSON.parse(localStorage.getItem("populationData"));

  lsPopData.forEach((item) => {
    populationDict[item.country] = parseInt(item.population);
  });

  console.log("Populating population :)");
  console.log(populationDict);
};

// AXIOS

document.addEventListener("DOMContentLoaded", function () {
  // load world population
  axios
    .get(localPopulationURL)
    .then(function (popRes) {
      window.localStorage.setItem(
        "populationData",
        JSON.stringify(popRes.data)
      );
    })
    .catch(function (error) {
      console.log(error);
    })
    .then(function () {
      populateDict();
      console.log("Population data loaded");
    });

  // load external COVID jason

  if (checkOldData()) {
    axios
      .get(URL)
      .then(function (response) {
        let now = new Date();

        window.localStorage.setItem("dataDate", now.getTime() / 1000);
        resData = response.data;
        console.log(resData);
        window.localStorage.setItem("countryData", JSON.stringify(resData));
        createSelector();
        drawChart(countries, metric);
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(function () {
        console.log("Finished fetching...");
      });
  } else {
    console.log("Data is fresh, no fetching.");
  }
});
