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
         keywords: '',
         openNow: true
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

   //// TODO: limit radius to only numbers between 0 - 100
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
               <PerformAPICall inputData = {this.state}/>
            </div>
         </div>
      );
   }
}

//// TODO: determine if a class or function is better because we aren't storing data
// Create a class to find and store JSON data for potential restaurants
class PerformAPICall extends React.Component
{
   constructor(props)
   {
      super(props);
      this.state = {
         searchPlaceIDs: [],
      }
   }

   // componentDidUpdate()
   // {
   //    console.log(
   //       'NewRadius: ' + this.props.inputData.radius + 
   //       '\nNewKeywords: ' + this.props.inputData.keywords +
   //       '\nNewOpenNow: ' + this.props.inputData.openNow      
   //    );
   // }

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
      
      await callGetUserPosition().then((position) => {
         userLatitude = position.coords.latitude;
         userLongitude = position.coords.longitude;
         console.log('Lat: ' + userLatitude + '\nLong: ' + userLongitude);
      })
      .catch((err) => {
         console.error(err.message);
      })

      // API call is in meters so convert miles to meters
      const meterRadius = this.props.inputData.radius * 1609.34;

      const placeSearchURL = //'https://cors-anywhere-chance.herokuapp.com/' + 
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 
      'key=' + apiKey + 
      '&location=' + userLatitude + ',' + userLongitude +
      '&radius=' + meterRadius + 
      '&type=restaurant' + 
      '&keyword=' + this.props.inputData.keywords;

      
      console.log(
         'Radius(miles, meters): ' + this.props.inputData.radius + ', ' + meterRadius + 
         '\nKeywords: ' + this.props.inputData.keywords +
         '\nOpenNow: ' + this.props.inputData.openNow      
      );

      console.log(placeSearchURL);

      FetchPlaceSearchJSON(this.placeSearchURL).then((placeIDs) => {
         console.log('placeIDs = ' + placeIDs.length);
         this.setState({searchPlaceIDs: placeIDs});
         //console.log(placeIDs[0]);
      })
      .catch(e => console.log(e));
   }

   

   //// TODO: create a button that will run the Fetch function when pressed
   //    <ul id = 'placeID'>
   //    {this.state.searchPlaceIDs.map(list => (<li key={list}>{list}</li>) )}
   // </ul>
   render()
   {
      return(
         <button onClick={() => this.errorCheckUserInput()}>CHANCE!!!</button>
      );
   }
}


async function FetchPlaceSearchJSON(placeSearchURL)
{
   var resultJson = [];

   // Wait for fetch to finish and throw errors if any
   let response = await fetch(placeSearchURL);
   if (!response.ok)
      throw new Error('HTTP error! Status: ' + response.status);

   // Parse response to get list of different restaurants
   let myJson = await response.json();
   resultJson = await myJson.results;

   //// TODO: Add a setting that removes any restaurants that are currently closed
   resultJson = await resultJson.filter(place => place.opening_hours.open_now === true)

   //// TODO: determine if no need to parse JSON for only place_id
   var placeIDs = await ParsePlaceSearchJSONForPlaceID(resultJson);

   return placeIDs;   
}


function ParsePlaceSearchJSONForPlaceID(resultJson)
{
   var placeIDs = resultJson.map(place => place.place_id);

   return placeIDs
}


// Grab the current user location and return a Promise while processing
   // In function so it does not grab location w/o user action
// https://gist.github.com/varmais/74586ec1854fe288d393
// Removed the options param from example as it was not needed
function callGetUserPosition()
{
   let GetUserPosition = new Promise( (resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
   });

   return GetUserPosition;
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