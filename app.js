
const API_KEY = "3ae09831f0afb2427e54231f37f3aa7c";

function WeatherApp(apiKey) {
    this.apiKey = apiKey;
    this.cityInput = document.getElementById("cityInput");
    this.searchBtn = document.getElementById("searchBtn");
    this.weatherDiv = document.getElementById("weather");
    this.forecastSection = document.getElementById("forecastSection");
    this.forecastDiv = document.getElementById("forecast");
}

WeatherApp.prototype.init = function() {
    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    this.cityInput.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            this.handleSearch();
        }
    }.bind(this));

    this.showWelcome();
};

WeatherApp.prototype.showWelcome = function() {
    this.weatherDiv.innerHTML =
        "<p>Search for a city to see its weather!</p>";
    this.forecastSection.hidden = true;
};

WeatherApp.prototype.handleSearch = function() {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name.");
        this.cityInput.focus();
        return;
    }

    this.getWeather(city);
    this.cityInput.value = "";
};

WeatherApp.prototype.showLoading = function() {
    this.weatherDiv.innerHTML = `
        <div class="spinner"></div>
        <p>Fetching weather...</p>
    `;

    this.forecastSection.hidden = true;
};

WeatherApp.prototype.showError = function(message) {
    this.weatherDiv.innerHTML =
        `<p class="error">${message}</p>`;

    this.forecastSection.hidden = true;
};

WeatherApp.prototype.getWeather = async function(city) {
    this.searchBtn.disabled = true;
    this.showLoading();

    const currentUrl =
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

    const forecastUrl =
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentResponse, forecastResponse] = await Promise.all([
            axios.get(currentUrl),
            axios.get(forecastUrl)
        ]);

        this.displayWeather(currentResponse.data);

        const dailyForecast =
            this.processForecastData(forecastResponse.data.list);

        this.displayForecast(dailyForecast);

        console.log("WeatherApp instance:", this);
    } catch (error) {
        console.error("Weather error:", error);

        if (error.response && error.response.status === 404) {
            this.showError("City not found. Please try another city.");
        } else if (error.response && error.response.status === 401) {
            this.showError("Invalid or inactive API key.");
        } else {
            this.showError("Unable to fetch weather. Please try again.");
        }
    } finally {
        this.searchBtn.disabled = false;
        this.cityInput.focus();
    }
};

WeatherApp.prototype.displayWeather = function(data) {
    this.weatherDiv.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img
            class="weather-icon"
            src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"
            alt="${data.weather[0].description}"
        >
        <p class="temperature">${Math.round(data.main.temp)}°C</p>
        <p class="description">${data.weather[0].description}</p>
        <p>Feels like: ${Math.round(data.main.feels_like)}°C</p>
        <p>Humidity: ${data.main.humidity}%</p>
    `;
};

WeatherApp.prototype.getForecast = async function(city) {
    const url =
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric`;

    const response = await axios.get(url);
    return response.data;
};

WeatherApp.prototype.processForecastData = function(list) {
    const daily = {};

    list.forEach(function(item) {
        const date = item.dt_txt.split(" ")[0];
        const time = item.dt_txt.split(" ")[1];

        if (time === "12:00:00" && !daily[date]) {
            daily[date] = item;
        }
    });

    return Object.values(daily).slice(0, 5);
};

WeatherApp.prototype.displayForecast = function(forecasts) {
    if (forecasts.length === 0) {
        this.forecastSection.hidden = true;
        return;
    }

    this.forecastDiv.innerHTML = forecasts.map(function(item) {
        const date = new Date(item.dt_txt.replace(" ", "T") + "Z");

        const day = date.toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "UTC"
        });

        return `
            <div class="forecast-card">
                <h3>${day}</h3>
                <img
                    src="https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png"
                    alt="${item.weather[0].description}"
                >
                <p class="forecast-temp">
                    ${Math.round(item.main.temp)}°C
                </p>
                <p class="forecast-description">
                    ${item.weather[0].description}
                </p>
            </div>
        `;
    }).join("");

    this.forecastSection.hidden = false;
};

const app = new WeatherApp(API_KEY);
app.init();
