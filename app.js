const URL = "https://pomber.github.io/covid19/timeseries.json";

const actionBtn = document.getElementById("action");
const readBtn = document.getElementById("read");
const checkBtn = document.getElementById("check");
actionBtn.addEventListener("click", action);
readBtn.addEventListener("click", readDate);
checkBtn.addEventListener("click", checkOldData);

// color palette
let palette = ["#ffa600", "#ff6361", "#bc5090", "#003f5c", "#58508d"];

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

function action() {
  console.log("Action pressed");
  //console.log("Checking LS:", checkLocalStorage());
  // take time and put it in the dataDate localstorage

  let now = new Date();
  console.log(now);
  window.localStorage.setItem("dataDate", now.getTime() / 1000);
}

function readDate() {
  let dataDate = window.localStorage.getItem("dataDate");
  console.log(dataDate);

  // create new date
  let lsDate = new Date(dataDate * 1000);
  let now = new Date();
  let diff = Math.round((now - lsDate) / 1000);
  console.log("Difference is ", diff, " seconds");
  console.log(lsDate);
  createSelector();
}

// AXIOS

document.addEventListener("DOMContentLoaded", function () {
  if (checkOldData()) {
    axios
      .get(URL)
      .then(function (response) {
        let now = new Date();

        window.localStorage.setItem("dataDate", now.getTime() / 1000);
        resData = response.data;
        console.log(resData);
        window.localStorage.setItem("countryData", JSON.stringify(resData));
      })
      .catch(function (error) {
        console.log(error);
      })
      .then(function () {
        createSelector();
        console.log("Finished fetching...");
      });
  } else {
    console.log("Data is fresh, no fetching.");
  }
});

const processData = () => {
  // get the data from localstorage
  const fullData = JSON.parse(localStorage.getItem("countryData"));
  console.table(fullData);

  // split by countries
};

processData();

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
      dataPoints.push(el[metric]);
    });
    dataObject["data"] = dataPoints;
    dataObject["backgroundColor"] = palette[index];
    dataObject["fill"] = false;
    dataObject["borderColor"] = palette[index];
    dataObject["pointRadius"] = 5;
    dataObject["pointHoverRadius"] = 10;

    countryDatasets.push(dataObject);
  });

  // parametrize the id?
  const ctx = document.getElementById("chart1").getContext("2d");

  console.log("XLABELS:", xlabels);
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
        fontSize: 54,
        fontWeigth: 100,
        position: "left",
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
};

drawChart(["Russia", "China", "Italy", "Germany", "Spain"], "confirmed");

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
    value: ["China", "Germany", "Italy", "US"],
    icon: "fa fa-times",
    onChange: (value) => {
      console.log(value);

      drawChart(value, "confirmed");
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
};
