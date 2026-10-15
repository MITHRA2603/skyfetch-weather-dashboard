
const API_KEY = "3ae09831f0afb2427e54231f37f3aa7c";
const city = "Chennai";

const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

function displayWeather(data) {
    const weatherDiv = document.getElementById("weather");

    weatherDiv.innerHTML = `
        <h2>${data.name}</h2>
        <img
            class="weather-icon"
            src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png"
            alt="${data.weather[0].description}"
        >
        <p class="temperature">${Math.round(data.main.temp)}°C</p>
        <p class="description">${data.weather[0].description}</p>
    `;
}

axios.get(url)
    .then(function(response) {
        console.log(response.data);
        displayWeather(response.data);
    })
    .catch(function(error) {
        console.error("Weather error:", error);
        document.getElementById("weather").innerHTML =
            "<p>Unable to load weather. Check your API key.</p>";
    });
