# `Chance A Restaurant`
## Notes and Purpose
This app was developed using React.js and was my first attempt at designing and building an app.
I originally came up with the idea for this app during a round table discussion of what to eat for dinner with my friends. We tend to take a while to pick so I asked my friends and it was decided that if I made an app to randomly pick restaurants, we would use it to speed up the process and get some FOOD!!!

## How it works
Using the react library, I use an premade API key to make a call to the Google Maps API (specifically the Places API). After waiting for a response, I parse the data, randomly pick a restaurant, and display it for the user. From there, the user can choose to keep the displayed restaurant or randomly load a new one from the remaining choices.

## Important notes
In order to prevent misuse of my API key, it will NOT be included in this repo as it is public. Instead, I will be providing instructions on how to make your own key and where to store it (for those wanting to build upon this). And for those wanting to use the app without the additional steps, I still need to research how to create an easy-to-use version that doesn't have the potential for abuse so I aplogize but you'll need to create your own key as well.

# Creating your own API key and adding it to this app
Follow this link to create your own Google Maps API key.
https://developers.google.com/maps/documentation/javascript/get-api-key

For restricting the API key, you can limit it to Maps JS API and Places API key (although leaving it unrestricted should work fine).

Now that you have your API key, you need to create a file called 'api_key.js' inside the 'src' folder. Inside this file, copy this code:
`<
   const apiKey = 'insertYourKeyHere';
   module.exports = apiKey;
>`


# React supplied notes
## npm start

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## npm test

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## npm run build

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.
