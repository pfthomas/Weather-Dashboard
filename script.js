var currentCity = $("#current-city");
var storedCity = [];
var city="";
var cityTemp = $("#temp");
var cityHumidity = $("#humidity");
var cityWindSpeed = $("#wind-speed");
var cityUvIndex = $("#uv-index");
var citySearch= $("#city-search");
var searchBtn = $("#search-btn");
$("#search-btn").on("click",showCurrentForecast);
$(document).on("click",grabPreviousCity);
$(window).on("load",showPreviousCity);

function fetchUVIndex(lon,lat){
    $.ajax({

            url:"https://api.openweathermap.org/data/2.5/uvi?appid="+ "2ef4d22f71037ab20d00f968d22b8222"+"&lat="+lat+"&lon="+lon,
            method:"GET"

            }).then(function(result){
                $(cityUvIndex).html(result.value);
            });
}

//checks to see if the city is already logged
function checkForCity(cityInput){
    for(let j=0;j<storedCity.length;j++){

        if (cityInput.toUpperCase()===storedCity[j]){
            return false;
        }
    }
    return true;
}
//grab weather info from the weather api
function fetchWeather(city){
    $.ajax({

        url:"https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + "2ef4d22f71037ab20d00f968d22b8222",
        method:"GET",

    }).then(function(result){

        console.log(result);
        var weatherImage = result.weather[0].icon;
        var imageLink = "https://openweathermap.org/img/wn/" + weatherImage + "@2x.png";
        var date = new Date(result.dt*1000).toLocaleDateString();
        $(currentCity).html(result.name + "(" + date + ")" + "<img src=" + imageLink+">");

        var tempF = (result.main.temp - 273.15) * 1.80 + 32; //converting from kelvin
        $(cityTemp).html((tempF).toFixed(2) + "&#8457");


        // Display the Humidity
        $(cityHumidity).html(result.main.humidity+"%");
       
       

        
        var windSpeed=(result.wind.speed*2.237).toFixed(1);
        $(cityWindSpeed).html(windSpeed + " Miles per Hour");
        //wind converted to mph
        
        
        fetchUVIndex(result.coord.lon,result.coord.lat);
        //calling uvindex function with coordinates of city 
        fiveDayForecast(result.id);

        if(result){
            storedCity=JSON.parse(localStorage.getItem("stored-city"));
            console.log(storedCity);
            if (storedCity==null){
                storedCity=[];
                storedCity.push(city.toUpperCase()
                );
                localStorage.setItem("stored-city",JSON.stringify(storedCity));
                addToList(city);
            }
            else {
                if(checkForCity(city)==true){
                    storedCity.push(city.toUpperCase());
                    localStorage.setItem("stored-city",JSON.stringify(storedCity));
                    addToList(city);
                }
            }
        }

    });
}
//shows the current forecast
function showCurrentForecast(event){
    event.preventDefault();

    if(citySearch.val()!==""){

        city=citySearch.val();
        fetchWeather(city);
    }
}
// shows weather for next 5 days
function fiveDayForecast(city){
    $.ajax({

        url:"https://api.openweathermap.org/data/2.5/forecast?id=" + city + "&appid=" + "2ef4d22f71037ab20d00f968d22b8222",
        method:"GET"

    }).then(function(result){        
        for (i=0;i<5;i++){

            var date= new Date((result.list[((i+1)*8)-1].dt)*1000).toLocaleDateString();
            var weatherImage= result.list[((i+1)*8)-1].weather[0].icon;
            var imageLink="https://openweathermap.org/img/wn/" + weatherImage + ".png";
            var temp= result.list[((i+1)*8)-1].main.temp;
            var tempF=(((temp-273.5)*1.80)+32).toFixed(2);
            var windSpeed = (result.list[(i+1)].wind.speed*2.237).toFixed(1);
            var humidity= result.list[((i+1)*8)-1].main.humidity;
        
            $("#forecastDate" + i).html(date);
            $("#forecastImage" + i).html("<img src=" + imageLink + ">");
            $("#forecastTemp" + i).html(tempF + "&#8457");
            $("#forecastWind" + i).html(windSpeed + " Mph");
            $("#forecastHumidity" + i).html(humidity + "%");
        }        
    });
}
//adding city to list of cities 
function addToList(city){
    var listEl= $("<li>" + city.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", city.toUpperCase());
    $(".list-group").append(listEl);
}



function showPreviousCity(){
    $("ul").empty();
    var storedCity = JSON.parse(localStorage.getItem("stored-city"));
    if(storedCity!==null){
        storedCity=JSON.parse(localStorage.getItem("stored-city"));
        for(i=0; i<storedCity.length;i++){
            addToList(storedCity[i]);
        }
        city=storedCity[i-1];
        fetchWeather(city);
    }
}

//show city from history when clicked on
function grabPreviousCity(event){
    var listEl=event.target;
    if (event.target.matches("li")){
        city=listEl.textContent;
        fetchWeather(city);
    }
}
