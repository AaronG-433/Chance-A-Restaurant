/*************************
Author: Aaron M Gaskin
Purpose: Randomly pick a restuarant based on user criteria because
   my friends are super indecisive and I WANNA EAT!!!!

How it works: Use the react front-end library to fetch from the
   Google Maps Places API based on user location and input. Then,
   parse data, randomly pick a restaurant, and finally display 
   restaurant data to the user.

Languages: React front-end with JSX, HTML, and CSS mixed in

Note: only used App.js and App.css so far as this is mainly a 
   front-end project. Might create user accounts later and incorporate
   backend.
*************************/

import './App.css';
import React from 'react';

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
         <InputComponents />
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
         openNow: true,
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
         <div>
            <div className = 'Input-Components'>
               <form>
                  <label>
                     Search radius in miles:
                     <input name='radius' type='text' placeholder='Ex: 5'
                        value={this.state.radius} onChange={this.handleInputChange}
                     />
                  </label>
                  <br />

                  <label>
                     Restaurant type:
                     <input name='keywords' type='text' placeholder='Ex: hispanic'
                        value={this.state.keywords} onChange={this.handleInputChange}
                     />
                  </label>
                  <br />

                  <label>
                     Show only open restaurants:
                     <input name='openNow' type='checkbox'
                        value={this.state.openNow} checked={this.state.openNow} onChange={this.handleInputChange}/>
                  </label>
                  <br />
               </form>
               <PerformAPICall userInputData = {this.state}/>
            </div>
         </div>
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

      //// TODO: Add a setting that removes any restaurants that are currently closed
      // resultJson = await resultJson.filter(place => place.opening_hours.open_now === true)

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
         <div>
            <button onClick={() => this.errorCheckUserInput()}>CHANCE!!!</button>
            <RandomlyChooseARestaurantAndDisplayData
               places = {this.state.places} 
               openNow = {this.props.userInputData.openNow}
            />
         </div>
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
         remainingPlaces: []
      };
   }

   componentDidUpdate(prevProps)
   {
      if(prevProps.places !== this.props.places)
      {
         // Filter out duplicate restaurants
         let filteredPlaces = this.removeDuplicateAndClosedRestaurants(this.props.places);

         // Randomly choose a restuarant and remove it from list
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


      //// TODO: Remove closed restaurants if openNow = checked
      if (this.props.openNow)
      {
         console.log("We open bois");
      }


      return filteredPlaces;
   }


   async randomlyPickRestaurantFromPlacesThenUpdateRemaining(tempPlaces)
   {
      // If no remaining places, reset randomPlace and prompt user to "CHANCE!!!" again
      if (tempPlaces.length === 0)
      {

         this.setState({randomPlace: []});

         return;
      }

      // Randomly pick new place
      const max = tempPlaces.length;
      const rand =  Math.floor(Math.random() * max);
      const randPlace = tempPlaces[rand];


      // Remove place from remaining places and save
      await tempPlaces.splice(rand, 1);
      this.setState({randomPlace: randPlace, remainingPlaces: tempPlaces});
   }

   render()
   {
      return(
         <div id = 'placeID'>
            {this.state.randomPlace.name ? this.displayRestaurantData(this.state.randomPlace)
               : <h1>Time to chance it!</h1>
            }
         </div>
      );
   }

   
   displayRestaurantData(randomPlace)
   {
      // Display restaurant data ***Note: no price b/c often not available***
      const numOfRemainingPlaces = <li>Remaining places: {this.state.remainingPlaces.length}</li>
      const restName = <li>{randomPlace.name}</li>;

      const photoInfo = randomPlace.photos[0];
      const photoURL = 'https://maps.googleapis.com/maps/api/place/photo?maxheight=400' + 
      '&key=' + apiKey + 
      '&photoreference=' + photoInfo.photo_reference;
      const photoSource = photoInfo.html_attributions;   //// TEST

      // Create HTML elements to display all the restaurant data
      let restPhoto;
      if (photoSource)
      {
         restPhoto = <li>
            <img src={photoURL} alt="Food from chosen restaurant or chosen restaurant" />
            <div>Photo Source: &nbsp;<span dangerouslySetInnerHTML={{__html: photoSource}} /></div>
         </li>;
      }
      else
      {
         restPhoto = <li>
            <img src={photoURL} alt="Food from chosen restaurant or chosen restaurant" />
         </li>; 
      }
      const restRating = <li>{randomPlace.rating}</li>
      const restLocation = <li>{randomPlace.vicinity}</li>;


      // Add a 'Retry' button that picks a new restaurant from remaining places
      const retryButton = <button onClick={() => 
         this.randomlyPickRestaurantFromPlacesThenUpdateRemaining(this.state.remainingPlaces)}
         >
         Chance Again?
      </button>

      return (
         <ul>
            {restName}
            {restPhoto}
            {restRating}
            {restLocation}
            {numOfRemainingPlaces}
            {retryButton}
         </ul>
      )
   }
}

//// TODO: Move the API key and other sensitive data into secure document
const apiKey = 'AIzaSyDBH1Do7uRmfF54CvPVpZhbka7v4xTaCfI';

export default App;