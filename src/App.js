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
                        value={this.state.openNow} checked='checked' onChange={this.handleInputChange}/>
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
      console.log('openNow = ' + this.props.userInputData.openNow);

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

      // API call is in meters so convert miles to meters
      const meterRadius = this.props.userInputData.radius * 1609.34;

      const placeSearchURL = 'https://cors-anywhere-chance.herokuapp.com/' + 
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 
      'key=' + apiKey + 
      '&location=' + userLatitude + ',' + userLongitude +
      '&radius=' + meterRadius + 
      '&type=restaurant' + 
      '&keyword=' + this.props.userInputData.keywords;

      console.log('URL = ' + placeSearchURL);

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
         randomPlace: []
      };
   }

   componentDidUpdate(prevProps)
   {
      // Randomly choose a place and save it
      if(prevProps.places !== this.props.places)
      {
         const filteredPlaces = this.removeDuplicateAndClosedRestaurants(this.props.places);
         const max = filteredPlaces.length;
         const rand =  Math.floor(Math.random() * max);
         console.log('Max = ' + max);
         console.log('Random = ' + rand);
         this.setState({randomPlace: filteredPlaces[rand]});

         console.log(filteredPlaces[rand]);
      }
   }


   removeDuplicateAndClosedRestaurants(places)
   {
      // Remove duplicate restaurants
      let filteredPlaces = Array.from( new Set( places.map(place => place.name)))
         .map(name => {
            return places.find(place => place.name === name)
         })


      //// TODO: Remove closed restaurants if openNow = checked


      return filteredPlaces;
   }

   
   displayRestaurantData(randomPlace)
   {
      console.log('Place name = ' + randomPlace.name);

      // Display restaurant data ***Note: no price b/c often not available***
      const restName = <li>{randomPlace.name}</li>;
      const restPicture = <li>Insert Picture</li>;    //// TODO: add img
      const restRating = <li>{randomPlace.rating}</li>
      const restLocation = <li>{randomPlace.vicinity}</li>;

      return (
         <ul>
            {restName}
            {restPicture}
            {restRating}
            {restLocation}
         </ul>
      )

   }

   render()
   {
      return(
         <div id = 'placeID'>
            {this.state.randomPlace.name ? this.displayRestaurantData(this.state.randomPlace)
               : <h1>Empty</h1>
            }
         </div>
      );
   }
}





//// TODO: Move the API key and other sensitive data into secure document
const apiKey = 'AIzaSyDBH1Do7uRmfF54CvPVpZhbka7v4xTaCfI';

export default App;