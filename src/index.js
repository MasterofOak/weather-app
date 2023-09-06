import './style.css';
import { format } from 'date-fns';

const DEFAULT_LOCATION = localStorage.getItem('location') ?? null;
window.addEventListener('load', () => {
  return DEFAULT_LOCATION ? getWeatherData(DEFAULT_LOCATION) : getWeatherData();
});

async function getWeatherData(loc = 'Warsaw') {
  try {
    const API_KEY = 'cb1a47541cb74a889db123750232408';
    const location = loc;
    const url = `http://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=7&aqi=yes&alerts=no`;
    const response = await fetch(url);
    if (response.status === 400) throw new Error('Invalid input');
    const data = await response.json();
    console.log(data);
    localStorage.setItem('location', JSON.stringify(data.location.name));
    displayMainInfo(data);
  } catch (err) {
    console.log(err);
    const error = document.getElementById('error-banner');
    error.classList.remove('hidden');
    document.body.style.overflowY = 'hidden';
    document.documentElement.scrollTop = 0;
  }
}
function formHandler() {
  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('search-bar').value;
    getWeatherData(input);
  });
}
function displayMainInfo(weather) {
  const header = document.getElementById('location');
  header.textContent = weather.location.name;
  const mainInfo = document.querySelectorAll('.main-info');
  Array.from(mainInfo).map((item, index) => {
    item.innerHTML = '';
    const day = weather.forecast.forecastday[index];
    const h4 = document.createElement('h4');
    const weatherIcon = document.createElement('img');
    const condition = document.createElement('div');
    const feelsLike = document.createElement('div');

    h4.classList.add('condition-header');
    weatherIcon.classList.add('weather-icon');
    condition.classList.add('condition-text');
    feelsLike.classList.add('feels-like');

    item.appendChild(h4);
    item.appendChild(weatherIcon);
    item.appendChild(condition);
    item.appendChild(feelsLike);

    h4.textContent = `${format(new Date(day.date), 'd MMMM, EEEE')}`;
    weatherIcon.src = day.day.condition.icon;
    condition.textContent = `${day.day.condition.text}`;
    feelsLike.innerHTML = `Feels like: <span class="degree">${day.day.avgtemp_c}°C</span>`;
    setVideo(index, day.day.condition.code);
  });
  displayFullInfo(weather);
  displayHourlyWeather(weather);
  showVideo();
}
function displayFullInfo(weather) {
  const cards = document.querySelectorAll('.full-info');
  Array.from(cards).map((item, index) => {
    item.innerHTML = '';
    const day = weather.forecast.forecastday[index];
    const fullData = {
      sunrise: `<span class="material-symbols-outlined">backlight_high</span> Sunrise: <span class="value">${day.astro.sunrise}</span>`,
      sunset: `<span class="material-symbols-outlined">backlight_low</span> Sunset: <span class="value">${day.astro.sunset}</span>`,
      minTemp: `<span class="material-symbols-outlined">thermometer_minus</span> Min temp.: <span class="value degree">${day.day.mintemp_c}°C</span>`,
      maxTemp: `<span class="material-symbols-outlined">thermometer_add</span> Max temp.: <span class="value degree">${day.day.maxtemp_c}°C</span>`,
      humidity: `<span class="material-symbols-outlined">humidity_percentage </span> Humidity: <span class="value">${day.day.avghumidity}%</span>`,
      perciptaion: `<span class="material-symbols-outlined">umbrella</span> Perciptaion: <span class="value">${day.day.totalprecip_mm}mm</span>`,
      wind: `<span class="material-symbols-outlined">air</span> Wind: <span class="value">${day.day.maxwind_kph}kmp</span>`,
      visibilitty: `<span class="material-symbols-outlined"> visibility</span> Visibilitty: <span class="value">${day.day.avgvis_km}km</span>`,
      uv: `<span class="material-symbols-outlined">eyeglasses</span> UV index: <span class="value">${day.day.uv}</span>`,
      air: `<span class="material-symbols-outlined">airwave</span> Air quality: <span class="value">${getQuality(
        day.day.air_quality['us-epa-index']
      )}</span>`,
    };
    const keys = Object.keys(fullData);
    for (let i = 0; i < 10; i++) {
      const div = document.createElement('div');
      div.classList.add('info-item');
      item.appendChild(div);
    }
    const items = item.querySelectorAll('.info-item');
    Array.from(items).map((item, index) => {
      item.innerHTML = fullData[keys[index]];
    });
    if (index !== 0) item.classList.add('hidden');
  });
  expandCard();
}
function displayHourlyWeather(weather) {
  const container = document.getElementById('hourly-weather');
  container.innerHTML = '';
  const hours = weather.forecast.forecastday[0].hour;
  hours.map((hour) => {
    const div = document.createElement('div');
    const h4 = document.createElement('h4');
    const weatherIcon = document.createElement('img');
    const feelsLike = document.createElement('div');

    container.appendChild(div);
    div.appendChild(h4);
    div.appendChild(weatherIcon);
    div.appendChild(feelsLike);

    h4.textContent = `${format(new Date(hour.time), 'p')}`;
    weatherIcon.src = hour.condition.icon;
    feelsLike.innerHTML = `Feels like: <span class="degree">${hour.temp_c}°C</span>`;
  });
}
function changeMeasurements() {
  const tempPicker = document.getElementById('temp-picker');
  const celsiusBtn = document.getElementById('celsius');
  const fahrenheitBtn = document.getElementById('fahrenheit');
  celsiusBtn.setAttribute('disabled', true);
  function convert(unit) {
    const degrees = document.querySelectorAll('.degree');
    Array.from(degrees).forEach((item) => {
      const text = item.textContent;
      const value = text.slice(0, text.length - 2);
      switch (unit) {
        case 'cel':
          return (item.textContent = `${((value - 32) / 1.8).toFixed(1)}C°`);
        case 'fah':
          return (item.textContent = `${(value * 1.8 + 32).toFixed(1)}F°`);
      }
    });
  }
  tempPicker.addEventListener('click', (e) => {
    if (e.target === fahrenheitBtn) {
      convert('fah');
      fahrenheitBtn.setAttribute('disabled', true);
      celsiusBtn.removeAttribute('disabled');
    } else {
      convert('cel');
      celsiusBtn.setAttribute('disabled', true);
      fahrenheitBtn.removeAttribute('disabled');
    }
  });
}
function expandCard() {
  const cards = document.querySelectorAll('.upcoming-days');
  Array.from(cards).forEach((card) => {
    card.addEventListener('mouseenter', (e) => {
      const target = e.currentTarget;
      const div = target.querySelector('.full-info');
      target.style.gridArea = 'clicked';
      div.classList.remove('hidden');
      Array.from(cards).forEach((card) => {
        if (card !== target) card.classList.add('hidden');
      });
    });
    card.addEventListener('mouseleave', (e) => {
      const target = e.currentTarget;
      const div = target.querySelector('.full-info');
      target.style.removeProperty('grid-area');
      div.classList.add('hidden');
      Array.from(cards).forEach((card) => {
        if (card !== target) card.classList.remove('hidden');
      });
    });
  });
}
function getQuality(index) {
  switch (index) {
    case 1:
      return index + ' Good';
    case 2:
      return index + ' Moderate';
    case 3:
      return index + ' Unhealthy for sensitive group';
    case 4:
      return index + ' Unhealthy';
    case 5:
      return index + ' Very Unhealthy';
    case 6:
      return index + ' Hazardous';
    default:
      return 'No data';
  }
}
function closeError() {
  const error = document.getElementById('error-banner');
  error.addEventListener('click', () => {
    error.classList.add('hidden');
    document.body.style.overflowY = 'hidden';
  });
}
function setVideo(index, code) {
  const card = document.querySelectorAll('.weather-card')[index];
  const video = card.querySelector('video');
  video.muted = true;
  video.autoplay = false;
  video.controls = false;
  video.classList.add('hidden');
  switch (code) {
    case 1000:
      video.src = '../assets/videos/sunny.mp4';
      break;
    case 1180:
    case 1183:
    case 1186:
    case 1192:
    case 1195:
    case 1063:
      video.src = '../assets/videos/rainy.mp4';
      break;
    case 1003:
    case 1006:
    case 1030:
    case 1009:
      video.src = '../assets/videos/cloudy.mp4';
      break;
    case 1213:
    case 1210:
    case 1066:
      video.src = '../assets/videos/snowy.mp4';
      break;
    default:
      break;
  }
}
function showVideo() {
  const cards = document.querySelectorAll('.weather-card');
  Array.from(cards).forEach((card) => {
    const video = card.querySelector('video');
    card.addEventListener('mouseenter', () => {
      video.classList.remove('hidden');
      video.play();
    });
    card.addEventListener('mouseleave', () => {
      video.classList.add('hidden');
      video.pause();
      video.currentTime = 0;
    });
  });
}
formHandler();
changeMeasurements();
closeError();
