
let map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);
let marker;


async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) {
    alert("Please enter a city name!");
    return;
  }

  try {

    const weatherRes = await fetch(`http://localhost:5000/api/weather/${city}`);
    const weatherData = await weatherRes.json();


    const forecastRes = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=f7245aaa5597d50b03ec6f1ed9ce06b1&units=metric`
    );
    const forecastData = await forecastRes.json();


    displayCurrentWeather(weatherData);
    displayForecast(forecastData);
    displayAlerts(weatherData, forecastData);


    updateMap(weatherData.coord.lat, weatherData.coord.lon, city);


    saveToHistory(city);

  } catch (err) {
    console.error("Error fetching data:", err);
    alert("Could not fetch weather data. Please try again.");
  }
}


function displayCurrentWeather(data) {
  const weatherDiv = document.getElementById("currentWeather");
  weatherDiv.innerHTML = `
    <h2>Current Weather in ${data.name}</h2>
    <p>🌡 Temp: ${data.main.temp}°C</p>
    <p>💧 Humidity: ${data.main.humidity}%</p>
    <p>🌬 Wind: ${data.wind.speed} m/s</p>
    <p>🌥 Condition: ${data.weather[0].description}</p>
  `;
}


function displayForecast(data) {
  const forecastDiv = document.getElementById("forecast");
  forecastDiv.innerHTML = "<h2>5-Day Forecast</h2>";

  const daily = data.list.filter(item => item.dt_txt.includes("12:00:00"));
  daily.forEach(day => {
    forecastDiv.innerHTML += `
      <div class="forecast-day">
        <p><b>${new Date(day.dt_txt).toDateString()}</b></p>
        <p>🌡 ${day.main.temp}°C</p>
        <p>🌥 ${day.weather[0].description}</p>
      </div>
    `;
  });
}


function displayAlerts(weather, forecast) {
  const alertsDiv = document.getElementById("alerts");
  alertsDiv.innerHTML = "<h2>⚠️ Alerts</h2>";
  let alerts = [];


  if (forecast.list.some(item => item.weather[0].main.toLowerCase().includes("rain"))) {
    alerts.push("🌧 Carry an umbrella!");
  }

  if (weather.main.temp > 35 || forecast.list.some(item => item.main.temp > 35)) {
    alerts.push("🥵 Stay hydrated! Heatwave warning.");
  }

  if (weather.wind.speed > 13.8 || forecast.list.some(item => item.wind.speed > 13.8)) {
    alerts.push("🌪 High winds warning!");
  }

  if (alerts.length === 0) {
    alertsDiv.innerHTML += "<p>No alerts 🚀</p>";
  } else {
    alerts.forEach(msg => {
      alertsDiv.innerHTML += `<p>${msg}</p>`;
    });
  }
}


function updateMap(lat, lon, city) {
  map.setView([lat, lon], 10);
  if (marker) marker.remove();
  marker = L.marker([lat, lon]).addTo(map).bindPopup(city).openPopup();
}


const themeBtn = document.getElementById("themeToggle");
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  themeBtn.textContent = document.body.classList.contains("dark") 
    ? "☀️ Toggle Light Mode" 
    : "🌙 Toggle Dark Mode";
});


const historyList = document.getElementById("history");
let searchHistory = JSON.parse(localStorage.getItem("weatherHistory")) || [];
renderHistory();

function saveToHistory(city) {
  if (!searchHistory.includes(city)) {
    searchHistory.unshift(city); 
    if (searchHistory.length > 5) searchHistory.pop(); 
    localStorage.setItem("weatherHistory", JSON.stringify(searchHistory));
    renderHistory();
  }
}

function renderHistory() {
  historyList.innerHTML = "";
  searchHistory.forEach(city => {
    const li = document.createElement("li");
    li.textContent = city;
    li.addEventListener("click", () => {
      document.getElementById("cityInput").value = city;
      getWeather();
    });
    historyList.appendChild(li);
  });
}
