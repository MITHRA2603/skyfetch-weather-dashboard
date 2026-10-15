
const API_KEY = "3ae09831f0afb2427e54231f37f3aa7c";

function WeatherApp(apiKey) {
  this.apiKey = apiKey;
  this.cityInput = document.getElementById("cityInput");
  this.searchBtn = document.getElementById("searchBtn");
  this.weatherDiv = document.getElementById("weather");
  this.forecastSection = document.getElementById("forecastSection");
  this.forecastDiv = document.getElementById("forecast");
  this.recentSearchesDiv = document.getElementById("recentSearches");
  this.clearHistoryBtn = document.getElementById("clearHistoryBtn");
  this.recentSearches = [];
}

WeatherApp.prototype.init = function () {
  this.searchBtn.addEventListener(
    "click",
    this.handleSearch.bind(this)
  );

  this.cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") this.handleSearch();
  });

  this.clearHistoryBtn.addEventListener(
    "click",
    this.clearHistory.bind(this)
  );

  this.loadRecentSearches();
  this.loadLastCity();
};

WeatherApp.prototype.handleSearch = function () {
  const city = this.cityInput.value.trim();

  if (!city) {
    this.showError("Please enter a city name.");
    return;
  }

  this.getWeather(city);
  this.cityInput.value = "";
};

WeatherApp.prototype.showError = function (message) {
  this.weatherDiv.innerHTML =
    `<p class="error">${message}</p>`;
  this.forecastSection.hidden = true;
};

WeatherApp.prototype.loadRecentSearches = function () {
  try {
    this.recentSearches = JSON.parse(
      localStorage.getItem("recentSearches") || "[]"
    );

    if (!Array.isArray(this.recentSearches)) {
      this.recentSearches = [];
    }
  } catch (error) {
    this.recentSearches = [];
  }

  this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function (city) {
  const formattedCity = city
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, letter => letter.toUpperCase());

  this.recentSearches = [
    formattedCity,
    ...this.recentSearches.filter(
      item => item.toLowerCase() !== formattedCity.toLowerCase()
    )
  ].slice(0, 5);

  localStorage.setItem(
    "recentSearches",
    JSON.stringify(this.recentSearches)
  );

  localStorage.setItem("lastCity", formattedCity);
  this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
  this.recentSearchesDiv.replaceChildren();

  this.recentSearches.forEach(function (city) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "recent-city-btn";
    button.textContent = city;

    button.addEventListener("click", function () {
      this.getWeather(city);
    }.bind(this));

    this.recentSearchesDiv.appendChild(button);
  }.bind(this));
};

WeatherApp.prototype.loadLastCity = function () {
  const lastCity = localStorage.getItem("lastCity");

  if (lastCity) {
    this.getWeather(lastCity);
  }
};

WeatherApp.prototype.clearHistory = function () {
  localStorage.removeItem("recentSearches");
  localStorage.removeItem("lastCity");

  this.recentSearches = [];
  this.displayRecentSearches();
  this.weatherDiv.innerHTML =
    "<p>Search for a city to see its weather.</p>";
  this.forecastSection.hidden = true;
};

WeatherApp.prototype.getForecast = async function (city) {
  const url =
    "https://api.openweathermap.org/data/2.5/forecast" +
    `?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

  const response = await axios.get(url);
  return response.data;
};

WeatherApp.prototype.processForecastData = function (list) {
  const daily = {};

  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];

    if (!daily[date] ||
        Math.abs(Number(item.dt_txt.slice(11, 13)) - 12) <
        Math.abs(Number(daily[date].dt_txt.slice(11, 13)) - 12)) {
      daily[date] = item;
    }
  });

  return Object.values(daily).slice(0, 5);
};

WeatherApp.prototype.displayWeather = function (data) {
  this.weatherDiv.innerHTML = `
    <div class="weather-card">
      <h2>${data.name}, ${data.sys.country}</h2>
      <img
        src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"
        alt="${data.weather[0].description}"
      >
      <p class="temperature">${Math.round(data.main.temp)}°C</p>
      <p>${data.weather[0].description}</p>
      <p>Feels like ${Math.round(data.main.feels_like)}°C</p>
      <p>Humidity: ${data.main.humidity}%</p>
      <p>Wind: ${data.wind.speed} m/s</p>
    </div>
  `;
};

WeatherApp.prototype.displayForecast = function (forecasts) {
  this.forecastDiv.innerHTML = forecasts.map(item => {
    const date = new Date(item.dt_txt.replace(" ", "T") + "Z");
    const day = date.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "UTC"
    });

    return `
      <article class="forecast-card">
        <h3>${day}</h3>
        <img
          src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"
          alt="${item.weather[0].description}"
        >
        <p class="forecast-temp">${Math.round(item.main.temp)}°C</p>
        <p>${item.weather[0].description}</p>
      </article>
    `;
  }).join("");

  this.forecastSection.hidden = forecasts.length === 0;
};

WeatherApp.prototype.getWeather = async function (city) {
  this.searchBtn.disabled = true;
  this.weatherDiv.innerHTML = "<p>Loading weather...</p>";

  const currentUrl =
    "https://api.openweathermap.org/data/2.5/weather" +
    `?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

  try {
    const [currentResponse, forecastData] = await Promise.all([
      axios.get(currentUrl),
      this.getForecast(city)
    ]);

    this.displayWeather(currentResponse.data);
    this.displayForecast(
      this.processForecastData(forecastData.list)
    );

    this.saveRecentSearch(currentResponse.data.name);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      this.showError("City not found. Please check the spelling.");
    } else if (error.response && error.response.status === 401) {
      this.showError("Invalid API key. Check your OpenWeatherMap key.");
    } else {
      this.showError("Unable to load weather. Please try again.");
    }
  } finally {
    this.searchBtn.disabled = false;
  }
};

const app = new WeatherApp(API_KEY);
app.init();
