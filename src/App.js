/*************************
Author: Aaron M Gaskin
Purpose: Randomly pick a restuarant based on user criteria because
   my friends are super indecisive and I WANNA EAT!!!!

How it works: Use the react front-end library to fetch from the
   Google Maps Places API based on user location and input. Then,
   parse data, randomly pick a restaurant, and finally display 
   restaurant data to the user.

Languages: React front-end with JSX, HTML, and CSS mixed in

Note:
   - only used App.js and App.css so far as this is mainly a 
   front-end project. Might create user accounts later and incorporate
   backend.
   - Cannot remove all closed restaurants as this info is not stored for all places so I
      removed the choice to do so
*************************/

import './App.css';
import {apiKey} from './api_key.js';
import React from 'react';
import Loader from "react-loader-spinner";
import { ConsoleWriter } from 'istanbul-lib-report';

function App()
{
   return (
      <div className='App'>
         <header className='App-header'>
            <p>
               Chance A Restaurant!
            </p>
         </header>
         <div className = 'App-body'>
            <div id='wrapper-height-padding'>
               <div id='wrapper'>
                  <InputComponents />
               </div>
            </div>
         </div>
      </div>
   );
}


/****************************** InputComponents ****************************************/
// Create input components for the user to use
class InputComponents extends React.Component
{
   //// TODO: need a...
      // checkbox for 'Remove closed stores'
      // 
   constructor(props)
   {
      super(props);
      this.state = {
         radius: 5,
         keywords: '',
         location: ''      //// TODO: add changeable location (address conversion?)
      };

      this.handleInputChange = this.handleInputChange.bind(this);
   }
   
   handleInputChange(event)
   {
      // Load data depending on if textbox or checkbox
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;

      this.setState({ [name]: value });
   }

   render()
   {
      return(
         <React.Fragment>
            <div className = 'Input-Components'>
               <form>
                  <label id='input-distance'>
                     Search radius in miles:
                     <input name='radius' type='text' placeholder='Ex: 5'
                        value={this.state.radius} onChange={this.handleInputChange}
                     />
                  </label>
                  <br />

                  <label id='input-keywords'>
                     Restaurant type:
                     <input name='keywords' type='text' placeholder='Ex: hispanic'
                        value={this.state.keywords} onChange={this.handleInputChange}
                     />
                  </label>
                  <br />
               </form>
            </div>
            <PerformAPICall userInputData = {this.state}/>
         </React.Fragment>
      );
   }
}


/********************************** PerformAPICall ****************************************/
// Perform Google Maps Place Search API call when "CHANCE!!!" button is pressed
class PerformAPICall extends React.Component
{
   constructor(props)
   {
      super(props);
      this.state = {
         places: [],
      }
   }


   //// TODO: perform error check on user input before allowing API call
   errorCheckUserInput()
   {
      // Check if radius is a number

      // Check if radius is a number between 0 and 60
      this.runAPISearchhUsingUserInput();
   }


   async runAPISearchhUsingUserInput()
   {
      let userLatitude = 0;
      let userLongitude = 0;
      
      await this.callGetUserPosition().then((position) => {
         userLatitude = position.coords.latitude;
         userLongitude = position.coords.longitude;
      })
      .catch((err) => {
         console.error(err.message);
      })

      // API call is in meters so convert miles to meters and create URL
      const meterRadius = this.props.userInputData.radius * 1609.34;

      const placeSearchURL = 'https://cors-anywhere-chance.herokuapp.com/' + 
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 
      'key=' + apiKey + 
      '&location=' + userLatitude + ',' + userLongitude +
      '&radius=' + meterRadius + 
      '&type=restaurant' + 
      '&keyword=' + this.props.userInputData.keywords;

      console.log('URL = ' + placeSearchURL);  //// TEST

      await this.checkIfResponseIsMoreThanOnePage(placeSearchURL)
      .then(places => { this.setState({places: places}); })
   }


   // Grab the current user location and return a Promise while processing
   // https://gist.github.com/varmais/74586ec1854fe288d393
   callGetUserPosition()
   {
      let GetUserPosition = new Promise( (resolve, reject) => {
         navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      return GetUserPosition;
   }


   async checkIfResponseIsMoreThanOnePage(placeSearchURL)
   {
      let nextPageToken = '';
      let returnPlaces = [];

      let tempSearchURL = placeSearchURL;

      // Fetch the 1st page of data
      await this.fetchPlaceSearchJSON(tempSearchURL, 0).then( data => {
         returnPlaces = data[0];
         nextPageToken = data[1];
      })
      .then(() => this.delay(2000))   // Give time for Google to create next page
      .then(async () => {

         // If 2nd page exists then fetch next page
         if (nextPageToken)
         {
            tempSearchURL = placeSearchURL +
            '&pagetoken=' + nextPageToken;

            await this.fetchPlaceSearchJSON(tempSearchURL).then( data => {
               returnPlaces = returnPlaces.concat(data[0]);
               nextPageToken = data[1];
            })
            .then(() => this.delay(2000))   // Give time for Google to create next page
            .then( async () => {

               // If 3rd page exists then fetch next page
               if (nextPageToken)
               {
                  tempSearchURL = placeSearchURL +
                  '&pagetoken=' + nextPageToken;

                  await this.fetchPlaceSearchJSON(tempSearchURL).then( data => {
                     returnPlaces = returnPlaces.concat(data[0]);
                     nextPageToken = data[1];
                  })
                  .catch(e => console.log(e));  
               }
            })
            .catch(e => console.log(e));
         }
      })
      .catch(e => console.log(e));

      return returnPlaces;
   }


   async fetchPlaceSearchJSON(placeSearchURL)
   {
      // Wait for fetch to finish and throw errors if any
      let response = await fetch(placeSearchURL);
      if (!response.ok)
         throw new Error('HTTP error! Status: ' + response.status);

      // Parse response to get list of different restaurants
      let responseJson = await response.json();

      let places = await responseJson.results;

      let nextPageToken = await responseJson.next_page_token;

      return [places, nextPageToken];   
   }


   // Delay code by inputted amount and return promise instead of callback
   // https://stackoverflow.com/questions/33843091/how-do-you-wrap-settimeout-in-a-promise/33843314
   delay(ms)
   {
      return new Promise(resolve => setTimeout( () => resolve(), ms));
   }


   render()
   {
      return(
         <React.Fragment>
            <button id='button-chance' onClick={() => this.errorCheckUserInput()}>
               CHANCE!!!
            </button>
            <div className = 'Restaurant-Data'>
               <RandomlyChooseARestaurantAndDisplayData
                  places = {this.state.places}
               />
            </div>
         </React.Fragment>
      );
   }
}


/********************* RandomlyChooseARestaurantAndDisplayData ****************************/
class RandomlyChooseARestaurantAndDisplayData extends React.Component
{
   constructor(props)
   {
      super(props);
      this.state = {
         randomPlace: [],
         remainingPlaces: [],
         chanceAgain: true
      };
   }

   componentDidUpdate(prevProps)
   {
      if(prevProps.places !== this.props.places)
      {
         // Filter out duplicate restaurants
         let filteredPlaces = this.removeDuplicateAndClosedRestaurants(this.props.places);

         // Randomly choose a restuarant to display and then remove it from list
         this.randomlyPickRestaurantFromPlacesThenUpdateRemaining(filteredPlaces);
      }
   }


   removeDuplicateAndClosedRestaurants(places)
   {
      // Remove duplicate restaurants by creating new Set that only allows unique entries
      // https://dev.to/marinamosti/removing-duplicates-in-an-array-of-objects-in-js-with-sets-3fep
      let filteredPlaces = Array.from( new Set( places.map( place => place.name)))
         .map(name => {
            // Return original JSON object if name in unique Set
            return places.find(place => place.name === name)
         })

      return filteredPlaces;
   }


   async randomlyPickRestaurantFromPlacesThenUpdateRemaining(tempPlaces)
   {

      // Randomly pick new place
      const max = tempPlaces.length;
      const rand =  Math.floor(Math.random() * max);
      const randPlace = tempPlaces[rand];


      // Remove place from remaining places and save
      await tempPlaces.splice(rand, 1);
      this.setState({randomPlace: randPlace, remainingPlaces: tempPlaces});

      // If no remaining places, remove 'Chance Again?' button
         // and prompt user to "CHANCE!!!" again
      if (tempPlaces.length === 0)
      {
            ////TODO: leave current restaurant displayed but remove "Chance Again?" button
         this.setState({chanceAgain: false});
         return;
      }
   }

   render()
   {
      return(
         <React.Fragment>
            {this.state.randomPlace.name ? this.displayRestaurantData(this.state.randomPlace)
               : <h2>Time to 'CHANCE!!!' it!</h2>
            }
         </React.Fragment>
      );
   }

   
   displayRestaurantData(randomPlace)
   {
      // Display name ***Note: no price b/c often not available***
      const restName = <div id='restaurant-name'>{randomPlace.name}</div>;

      // Display photo and source if it exists
      const photoInfo = randomPlace.photos[0];
      const photoURL = 'https://maps.googleapis.com/maps/api/place/photo?maxheight=200' + 
      '&key=' + apiKey + 
      '&photoreference=' + photoInfo.photo_reference;
      const photoSource = photoInfo.html_attributions;   //// TEST

      let restPhoto = null;
      if (photoURL)  // Check if photo exists
      {
         // Now check if photo source exists
         if (photoSource)  // If yes, include photo and source, else...
         {
            restPhoto = <div id='restaurant-photo'>
               <img src={photoURL} alt="Food from chosen restaurant or chosen restaurant" />
               <div id='restaurant-photo-source'>Photo Source: &nbsp;
                  <span dangerouslySetInnerHTML={{__html: photoSource}} />
               </div>
            </div>;
         }
         else  // ...just include photo
         {
            restPhoto = <div id='restaurant-photo'>
               <img src={photoURL} alt="Food from chosen restaurant or chosen restaurant" />
            </div>; 
         }
      }

      // Display rating and location, if they exist
      const restRating = (randomPlace.rating ? 
         <div id='restaurant-rating'>Rating: &nbsp;{randomPlace.rating}</div> : null);
      const restLocation = (randomPlace.vicinity ? 
         <div id='restaurant-location'>{randomPlace.vicinity}</div> : null);

      // Display number of remaining restaurants that were returned by the API search
      const numOfRemainingPlaces = (this.state.remainingPlaces.length !== 0 ? 
      <div id='remaining-places'>
         Remaining places: {this.state.remainingPlaces.length} </div> :
      <div>No remaining places. <br/>Please select 'CHANCE!!!' to load more.</div>);
      
      // Add a 'Retry' button that picks a new restaurant from remaining places
      const retryButton = (this.state.chanceAgain ? <button id='button-retry' onClick={() => 
         this.randomlyPickRestaurantFromPlacesThenUpdateRemaining(this.state.remainingPlaces)}
         >
         Chance Again?
      </button> : null);

      return (
         <React.Fragment>
            {restName}
            {restPhoto}
            {restRating}
            {restLocation}
            {numOfRemainingPlaces}
            {retryButton}
         </React.Fragment>
      )
   }
}

//// TODO: Move the API key and other sensitive data into secure document


export default App;