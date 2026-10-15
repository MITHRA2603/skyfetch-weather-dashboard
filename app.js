
const API_KEY = "3ae09831f0afb2427e54231f37f3aa7c";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherDiv = document.getElementById("weather");

function showLoading() {
    weatherDiv.innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Fetching weather...</p>
        </div>
    `;
}

function showError(message) {
    weatherDiv.innerHTML = `
        <p class="error">${message}</p>
    `;
}

function displayWeather(data) {
    weatherDiv.innerHTML = `
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
}

async function getWeather(city) {
    searchBtn.disabled = true;
    showLoading();

    try {
        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;

        const response = await axios.get(url);

        console.log(response.data);
        displayWeather(response.data);
    } catch (error) {
        console.error("Weather error:", error);

        if (error.response && error.response.status === 404) {
            showError("City not found. Please enter a valid city name.");
        } else if (error.response && error.response.status === 401) {
            showError("Invalid API key or the key is not active yet.");
        } else {
            showError("Unable to fetch weather. Check your internet connection and try again.");
        }
    } finally {
        searchBtn.disabled = false;
        cityInput.focus();
    }
}

function searchWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        showError("Please enter a city name.");
        cityInput.focus();
        return;
    }

    getWeather(city);
    cityInput.value = "";
}

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchWeather();
    }
});
