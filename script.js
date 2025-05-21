const apiKey = 'bb7b60061df9f3f50bf93e8e5cd23a68';
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('wind-speed');
const searchPage = document.querySelector('.search-page');
const resultPage = document.querySelector('.result-page');
const backBtn = document.querySelector('.back-btn');

// Add event listeners
searchBtn.addEventListener('click', getWeather);
document.querySelectorAll('.city-btn').forEach(button => {
    button.addEventListener('click', () => {
        cityInput.value = button.dataset.city;
        getWeather();
    });
});

async function getWeather() {
    const city = cityInput.value;
    if (!city) return;

    try {
        // Get current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        const currentData = await currentResponse.json();

        // Get yesterday's weather using timestamp
        const yesterday = Math.floor(Date.now() / 1000) - 86400;
        const historicalResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&dt=${yesterday}&appid=${apiKey}&units=metric`
        );
        const historicalData = await historicalResponse.json();

        // Update current weather display
        cityName.textContent = currentData.name;
        setWeatherIcon(currentData.weather[0].main);
        temperature.textContent = `Temperature: ${Math.round(currentData.main.temp)}°C`;
        description.textContent = `Weather: ${currentData.weather[0].description}`;
        humidity.textContent = `Humidity: ${currentData.main.humidity}%`;
        windSpeed.textContent = `Wind Speed: ${currentData.wind.speed} m/s`;

        // Compare with yesterday
        const tempDiff = currentData.main.temp - historicalData.current.temp;
        const humidityDiff = currentData.main.humidity - historicalData.current.humidity;

        document.getElementById('temp-comparison').innerHTML = `
            Temperature change: ${Math.abs(tempDiff).toFixed(1)}°C 
            <i class="fas fa-arrow-${tempDiff > 0 ? 'up trend-up' : 'down trend-down'}"></i>
        `;

        document.getElementById('humidity-comparison').innerHTML = `
            Humidity change: ${Math.abs(humidityDiff).toFixed(1)}% 
            <i class="fas fa-arrow-${humidityDiff > 0 ? 'up trend-up' : 'down trend-down'}"></i>
        `;

        // Generate weather advice
        const advice = getWeatherAdvice(currentData);
        document.getElementById('weather-advice').innerHTML = advice;

        // Show result page
        searchPage.classList.remove('active');
        resultPage.classList.add('active');
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('City not found! Please try again.');
    }
}

function setWeatherIcon(weatherMain) {
    const iconMap = {
        'Clear': 'sun',
        'Clouds': 'cloud',
        'Rain': 'cloud-rain',
        'Snow': 'snowflake',
        'Thunderstorm': 'bolt',
        'Drizzle': 'cloud-rain',
        'Mist': 'smog',
        'Smoke': 'smog',
        'Haze': 'smog',
        'Dust': 'smog',
        'Fog': 'smog',
    };

    const iconClass = iconMap[weatherMain] || 'cloud';
    weatherIcon.innerHTML = `<i class="fas fa-${iconClass}"></i>`;

    // Update the background based on the weather condition
    const weatherInfo = document.querySelector('.weather-info');
    weatherInfo.className = `weather-info ${weatherMain.toLowerCase()}`;
}

function getWeatherAdvice(weatherData) {
    const temp = weatherData.main.temp;
    const weather = weatherData.weather[0].main;
    let advice = '';

    // Temperature-based advice
    if (temp < 0) {
        advice += '❄️ Extremely cold! Wear warm layers and limit outdoor exposure.<br>';
    } else if (temp < 10) {
        advice += '🧥 Quite cold - wear a warm coat and gloves.<br>';
    } else if (temp < 20) {
        advice += '👕 Mild temperature - a light jacket might be needed.<br>';
    } else if (temp < 30) {
        advice += '☀️ Warm weather - perfect for outdoor activities.<br>';
    } else {
        advice += '🌡️ Very hot! Stay hydrated and seek shade when possible.<br>';
    }

    // Weather-based advice
    switch(weather) {
        case 'Rain':
            advice += '☔ Don\'t forget your umbrella!<br>Enjoy the soothing sound of rain.';
            break;
        case 'Snow':
            advice += '🌨️ Be careful on slippery surfaces.<br>Perfect time for a snowball fight!';
            break;
        case 'Thunderstorm':
            advice += '⛈️ Stay indoors and avoid open areas.<br>Watch the lightning show from a safe place.';
            break;
        case 'Clear':
            advice += '🌞 Great day for outdoor activities!<br>Don\'t forget your sunglasses.';
            break;
        case 'Clouds':
            advice += '☁️ Good conditions for most activities.<br>Enjoy the cool breeze.';
            break;
    }

    return advice;
}

// Add back button functionality
backBtn.addEventListener('click', () => {
    resultPage.classList.remove('active');
    searchPage.classList.add('active');
    cityInput.value = '';
});

// Add Enter key functionality
cityInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        getWeather();
    }
});

async function getWeather() {
    const city = cityInput.value;
    if (!city) return;

    try {
        // Get current weather
        const currentResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentData = await currentResponse.json();

        // Get forecast data
        const forecastResponse = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${currentData.coord.lat}&lon=${currentData.coord.lon}&appid=${apiKey}&units=metric`
        );
        
        const forecastData = await forecastResponse.json();

        // Update current weather display
        cityName.textContent = currentData.name;
        setWeatherIcon(currentData.weather[0].main);
        temperature.textContent = `Temperature: ${Math.round(currentData.main.temp)}°C`;
        description.textContent = `Weather: ${currentData.weather[0].description}`;
        humidity.textContent = `Humidity: ${currentData.main.humidity}%`;
        windSpeed.textContent = `Wind Speed: ${currentData.wind.speed} m/s`;

        // Update hourly forecast
        updateHourlyForecast(forecastData.list.slice(0, 5)); // Show next 12 hours (3-hour intervals)

        // Update comparisons and advice
        document.getElementById('temp-comparison').innerHTML = `
            <div class="current-temp">Current Temperature: ${Math.round(currentData.main.temp)}°C</div>
        `;

        document.getElementById('humidity-comparison').innerHTML = `
            <div class="current-humidity">Current Humidity: ${currentData.main.humidity}%</div>
        `;

        const advice = getWeatherAdvice(currentData);
        document.getElementById('weather-advice').innerHTML = advice;

        // Show result page
        searchPage.classList.remove('active');
        resultPage.classList.add('active');
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('City not found! Please try again.');
    }
}

function updateHourlyForecast(forecastList) {
    const forecastContainer = document.getElementById('hourly-forecast');
    forecastContainer.innerHTML = '';

    forecastList.forEach(forecast => {
        const time = new Date(forecast.dt * 1000);
        const hour = time.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-time">${hour12}${ampm}</div>
            <div class="forecast-icon">
                <i class="fas fa-${getWeatherIcon(forecast.weather[0].main)}"></i>
            </div>
            <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

function getWeatherIcon(weatherMain) {
    const iconMap = {
        'Clear': 'sun',
        'Clouds': 'cloud',
        'Rain': 'cloud-rain',
        'Snow': 'snowflake',
        'Thunderstorm': 'bolt',
        'Drizzle': 'cloud-rain',
        'Mist': 'smog',
        'Smoke': 'smog',
        'Haze': 'smog',
        'Dust': 'smog',
        'Fog': 'smog',
    };
    return iconMap[weatherMain] || 'cloud';
}

// ... (keep existing helper functions) ...