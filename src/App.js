import './App.css';
import React from 'react';
import {Map, GoogleApiWrapper, Marker} from 'google-maps-react';

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


// Create input components for the user to use
class InputComponents extends React.Component
{
   //// TODO: need a...
      // input box for range in miles (convert to meters using math)
      // input box for keywords (with example)
      // checkbox for 'Remove closed stores'
      // 
   constructor(props)
   {
      super(props);
      this.state = {
         radius: 5,
         keywords: 'hispanic',  //// TODO: remove this keyword; testing only
         openNow: true,
         location: ''            //// TODO: add changeable location
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
      
      await CallGetUserPosition().then((position) => {
         userLatitude = position.coords.latitude;
         userLongitude = position.coords.longitude;
         console.log('Lat: ' + userLatitude + '\nLong: ' + userLongitude);
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

      await CheckIfResponseIsMoreThanOnePage(placeSearchURL)
      .then(places => {
         console.log('Returned places = ' + places);
         console.log('Places length: ' + places.length);
         this.setState({places: places});
         console.log('Places: ' + places);
      })
      // .then(async places => {
      //    return Delay(places, 10000)
      //    .then(places => {
      //          console.log('Returned places = ' + places);
      //          console.log('Places length: ' + places.length);
      //          this.setState({places: places});
      //          console.log('Places: ' + places);
      //       })
      //    }
      // );
   }

   render()
   {
      return(
         <div>
            <button onClick={() => this.errorCheckUserInput()}>CHANCE!!!</button>
            <RandomlyChooseARestaurantAndDisplayData places = {this.state.places} />
         </div>
      );
   }
}

// Grab the current user location and return a Promise while processing
   // In function so it does not grab location w/o user action
// https://gist.github.com/varmais/74586ec1854fe288d393
// Removed the options param from example as it was not needed
function CallGetUserPosition()
{
   let GetUserPosition = new Promise( (resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
   });

   return GetUserPosition;
}


// Return a promise for places after timeout has elapsed
// https://stackoverflow.com/questions/33843091/how-do-you-wrap-settimeout-in-a-promise/33843314
function Delay(data , ms)
{
   return new Promise(resolve => setTimeout( () => resolve(data), ms));
}

async function CheckIfResponseIsMoreThanOnePage(placeSearchURL)
{
   let nextPageToken = '';
   let returnPlaces = [];

   let tempSearchURL = placeSearchURL;

   console.log('URL: ' + tempSearchURL);
   await  FetchPlaceSearchJSON(tempSearchURL, 0).then( data => {
      console.log('1st fetch: ' + data[0].length);
      returnPlaces = data[0];
      nextPageToken = data[1];
   })
   .then(() => Delay(null, 3000))
   .then(async () => {
      // If 2nd page exists then load next page
      if (nextPageToken)
      {
         tempSearchURL = placeSearchURL +
         '&pagetoken=' + nextPageToken;

         console.log('2nd page URL: ' + tempSearchURL);
         await FetchPlaceSearchJSON(tempSearchURL, 3000).then( data => {
            console.log('2nd fetch: ' + data[0].length);
            returnPlaces = returnPlaces.concat(data[0]);
            nextPageToken = data[1];
         })
         .then(() => Delay(null, 3000))
         .then( async () => {
            // If 3rd page exists then load next page
            if (nextPageToken)
            {
               tempSearchURL = placeSearchURL +
               '&pagetoken=' + nextPageToken;

               console.log('3rd page URL: ' + tempSearchURL);
               await FetchPlaceSearchJSON(tempSearchURL, 3000).then( data => {
                  console.log('3rd fetch: ' + data[0].length);
                  returnPlaces = returnPlaces.concat(data[0]);
                  nextPageToken = data[1];
               })
               .catch(e => console.log(e));  
            
               console.log('3rd Return places(' + returnPlaces.length + ')');
            }
         })
         .catch(e => console.log(e));
      
         console.log('2nd Return places(' + returnPlaces.length + ')');
      }
   })
   .catch(e => console.log(e));

   console.log('1st Return places(' + returnPlaces.length + ')');

   return returnPlaces;
}

//// TODO: try to move 3 sec timeouts into this function
async function FetchPlaceSearchJSON(placeSearchURL, delayTime)
{
   console.log('Fetch URL: ' + placeSearchURL);
   // Wait for fetch to finish and throw errors if any
   let response = await fetch(placeSearchURL);
   if (!response.ok)
      throw new Error('HTTP error! Status: ' + response.status);

   console.log('Response status: ' + response.status);

   // Parse response to get list of different restaurants
   let responseJson = await response.json();


   let places = await responseJson.results;

   let nextPageToken = await responseJson.next_page_token;

   if (!nextPageToken)
      console.log('No page token');

   console.log('Token = ' + nextPageToken);

   //// TODO: check if response has a next_page_token and perform another fetch if so

   //// TODO: check if returning entire response then parsing is better

   //// TODO: Add a setting that removes any restaurants that are currently closed
   // resultJson = await resultJson.filter(place => place.opening_hours.open_now === true)

   //// TODO: determine if no need to parse JSON for only place_id
   //var placeIDs = await ParsePlaceSearchJSONForPlaceID(resultJson);

   return [places, nextPageToken];   
}



class RandomlyChooseARestaurantAndDisplayData extends React.Component
{
   constructor(props)
   {
      super(props);
      this.state = {
         places: []
      };
   }

   componentDidUpdate(prevProps)
   {
      if(prevProps.places !== this.props.places)
      {
         this.setState({places: this.props.places});
      }
   }


   render()
   {
      return(
         <ul id = 'placeID'>
            {this.state.places.length ? (this.state.places.map(place => (<li key={place.place_id}>{place.name}</li>) ))
               : <li>Empty</li>
            }
         </ul>
      );
   }
}


//// TODO: Move the API key and other sensitive data into secure document
const apiKey = 'AIzaSyDBH1Do7uRmfF54CvPVpZhbka7v4xTaCfI';

//https://www.pluralsight.com/guides/how-to-use-geolocation-call-in-reactjs
class SimpleMap extends React.Component
{
   constructor()
   {
      super();
      this.state = {name: 'React'};
   }

   render()
   {
      return(
         <div>
            <Map
               google = {this.props.google}
               zoom={14}
               style={{height: '100%', width: '100%'}}
               initialCenter={{
                  lat: 23.456,
                  lng: -82.33
               }}
            >
               <Marker
                  onClick = {this.onMarkerClick}
                  name = {'My Marker'}
               />
            </Map>
         </div>
      );
   }
}

//// TEMP
export default App;

// export default GoogleApiWrapper({
//    apiKey: apiKey
// })(SimpleMap);