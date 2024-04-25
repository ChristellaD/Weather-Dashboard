
// ensure DOM content is parsed and fully loaded before script initialization
document.addEventListener("DOMContentLoaded", (event) => {
    console.log("DOM fully loaded and parsed"); 

    

    //search bar event listener
    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener('submit', async function (event) {
        event.preventDefault();
        const city = document.getElementById('city-input').value;
        if (!city) return; //if input is blank or city name is invalid, function ends
    saveToLocalStorage(city);
    await citySearch(city);
    });

    const searchHistory = document.getElementById('search-history');
    loadSearchHistory();    
    

    function saveToLocalStorage(city) {
        let historyArray = JSON.parse(localStorage.getItem('history')) || [];
        if (historyArray.indexOf(city) == -1){
            historyArray.push(city);
        }
        var noDupeArray = JSON.stringify(historyArray);
        window.localStorage.setItem("history", noDupeArray);;
    };  //turns city names into JSON strings to be saved in local storage
    function loadSearchHistory() {
        let noDupeArray = JSON.parse(localStorage.getItem('history')) || [];
        noDupeArray.forEach(city => {
            const historyButton = document.createElement('button');
            historyButton.classList.add('history-button');
            historyButton.textContent = city;
            historyButton.addEventListener('click', async () => {
                await citySearch(city);
            }); //turns each city found in local storage into clickable 'search buttons'
            
            searchHistory.appendChild(historyButton);
        });

    };

    const clearButton = document.getElementById('clear-button');
    clearButton.addEventListener('click', clearSearchHistory);
    function clearSearchHistory() {
      searchHistory.innerHTML = '';
      localStorage.removeItem('history');
    };
    


const APIKey = "60b770fb8a9fd15e8ba4eefb5a95d252";

    function citySearch(city) {
        const queryUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKey}&units=imperial`;
        
        fetchData(queryUrl)
        .then (data => {
            console.log('Weather data:', data);
            displayWeather(data);
        })
        .catch (error => {
            console.error('Error fetching weather data: ', error)
        });
    };

    function fetchData(queryUrl) {
        return fetch(queryUrl)
            .then (response => {
                if (!response.ok) {
                throw new Error('Failed to fetch data.')
                } return response.json();
            })
            .catch (error => {
                throw new Error('Error fetching data: ', error);
            });
        };

            function displayWeather(data) {

                const forecastsByDay = {};
    
                // forecast data for the next 5 days
                const today = new Date();
                today.setHours(0, 0, 0, 0); // set times to midnight for accurate averages
                for (const forecast of data.list) {
                    const forecastDate = new Date(forecast.dt * 1000); //converting unix timestamp to milliseconds
                    forecastDate.setHours(0, 0, 0, 0);
                    //find difference between next forecast day and today so function filters only for next 5 days
                    const diffTime = forecastDate - today;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays > 0 && diffDays <= 5) { 
                        const dateString = forecastDate.toISOString().split('T')[0]; // Get YYYY-MM-DD format
    
                        if (!forecastsByDay[dateString]) {
                            forecastsByDay[dateString] = [];
                        }
                        forecastsByDay[dateString].push(forecast);
                    }
                }
    
                const forecastBoxContainer = document.getElementById('forecastbox-container');
                forecastBoxContainer.innerHTML = ''; // Clear previous forecast boxes

                const fcTitle = document.createElement('h2');
                fcTitle.textContent = `${data.city.name}'s Forecast`;
                forecastBoxContainer.appendChild(fcTitle);
    
                for (const date in forecastsByDay) {
                    if (forecastsByDay.hasOwnProperty(date)) {
                        const forecastList = forecastsByDay[date];

                        const forecastBox = document.createElement('div');
                        forecastBox.classList.add('forecast');
                        forecastBoxContainer.appendChild(forecastBox);
    
                        const fcDate = document.createElement('h3');
                        fcDate.textContent = new Date(forecastList[0].dt * 1000).toDateString();
                        forecastBox.appendChild(fcDate);
    
                        let totalTemp = 0;
                        let totalWind = 0;
                        let totalHumidity = 0;
    
                        forecastList.forEach(forecast => {
                            totalTemp += forecast.main.temp;
                            totalWind += forecast.wind.speed;
                            totalHumidity += forecast.main.humidity;
                        });
    
                        const avgTemp = totalTemp / forecastList.length;
                        const avgWind = totalWind / forecastList.length;
                        const avgHumidity = totalHumidity / forecastList.length;
    
                        const fcTemp = document.createElement('h5');
                        fcTemp.textContent = `Temp: ${avgTemp.toFixed(1)}°F`;
                        forecastBox.appendChild(fcTemp);
    
                        const fcWind = document.createElement('h5');
                        fcWind.textContent = `Wind: ${avgWind.toFixed(1)} mph`;
                        forecastBox.appendChild(fcWind);
    
                        const fcHumidity = document.createElement('h5');
                        fcHumidity.textContent = `Humidity: ${avgHumidity.toFixed(1)}%`;
                        forecastBox.appendChild(fcHumidity);

                        const fcIconCode = forecastList[0].weather[0].icon;
                        const fcIconUrl = `https://openweathermap.org/img/wn/${fcIconCode}.png`;
                        const fcIconImage = document.createElement('img');
                        fcIconImage.src = fcIconUrl;
                        fcIconImage.alt = forecastList[0].weather[0].description;
                        forecastBox.appendChild(fcIconImage);
                    };
                };
    
                const mainCity = document.getElementById('city-date');
                mainCity.textContent = data.city.name;
    
                const mainCityTemp = document.getElementById('city-temp');
                mainCityTemp.textContent = 'Temperature: ' + data.list[0].main.temp + '°F';
    
                const mainCityWind = document.getElementById('city-wind');
                mainCityWind.textContent = 'Wind Speed: ' + data.list[0].wind.speed + ' mph';
    
                const mainCityHumidity = document.getElementById('city-humidity');
                mainCityHumidity.textContent = 'Humidity: ' + data.list[0].main.humidity + '%';
            };
        });