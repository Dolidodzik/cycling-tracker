# my-cycle-tracker

### This project will be bulit from following subprojects:

-Mobile app (aka private frontend. Private because it will require verification) - the app that I will use in background when I will be cycling, I will just run in background (sending BE the data) and show map with previous path and basic stats of cycling. It will be built using Expo + react-native-background-geolocation + react-native-maps.
-Backend - it will be responsible for authentication of private frontend, and get live coordinates, save them in DB, and host public API of my current trip/history of my trips. It will be built with Django + DRF.
-Website (public frontend) frontend bulit around public data taken from backend API.
