# Chance A Restaurant
### What this app does
This app takes in distance from the user and desired type of food (Ex: chinese, tacos, cheap, etc.) and randomly picks then returns a restaurant that fits this criteria.

### Backstory
This app was developed using React.js and was my first attempt at designing and building an app.  
I originally came up with the idea for this app during a round table discussion of what to eat for dinner with my friends. We tend to take a while to pick so I asked my friends and it was decided that if I made an app to randomly pick restaurants, we would use it to speed up the process and get some FOOD!!!

### How it works
I used the react library to build my app and a premade Google Maps API key (specifically the Places and Maps API) to make a request for restaurant data. This request goes through a 'cors-anywher' app running on Heroku before continuing on to go Google. Upon my app receiving the data, it parses the data, randomly picks a restaurant, and displays it for the user. From there, the user can choose to keep the displayed restaurant or randomly load a new one from the remaining choices.

### Important notes
In order to prevent misuse of my API key, it will NOT be included in this repository as it is public. Instead, I will be providing instructions on how to make your own key and where to store it (for those wanting to build upon this).  
And for those wanting to use the app without the additional steps, I still need to research how to create an easy-to-use version that doesn't have the potential for abuse so I aplogize but you'll need to create your own key as well.

#### Creating your own API key and adding it to this app
Follow this link to create your own Google Maps API key.
https://developers.google.com/maps/documentation/javascript/get-api-key

For restricting the API key, you can limit it to Maps JS API and Places API key (although leaving it unrestricted should work fine).

Now that you have your API key, you need to create a file called 'api_key.js' inside the 'src' folder. Inside this file, copy this code:
```
const apiKey = 'insertYourKeyHere';
module.exports = {apiKey};
```

### App restrictions
The Google API key returns, at most, the 60 closest restaurants that fit the criteria so if the user inputs a large distance, then not all restaurants in that area could be chosen. In addition, the initial search on the app takes approximately 4-8 seconds because the 60 restaurants are split over 3 web pages that are generated upon the request being sent so I had to manually delay the app in order to give Google time to process and create these pages.


## React supplied notes
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
