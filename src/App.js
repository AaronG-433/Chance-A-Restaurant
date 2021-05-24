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
         radius: 0,
         keywords: '',
         openNow: false
      };
   }


   handleSubmit(event) 
   {
      alert('Data was submitted: ' + this.state.radius);
   }
   render()
   {
      return(
         <div className = 'Input-compnents'>
            <form>
               <label>
                  Search radius in miles:
                  <input type='text' id='radius' placeholder='Ex: 5'/>
               </label>
               <br />
               <label>
                  Restaurant type:
                  <input type='text' id='keywords' name='' placeholder='Ex: hispanic' />
               </label>
               <br />
               <label>
                  Show only open restaurants:
                  <input type='checkbox' id='openNow' />
               </label>
               <br />
               <button onClick={() => {alert('Hi')}}>CHANCE!!!</button>
            </form>
         </div>
      );
   }
}

//// TODO: determine if a class or function is better because we aren't storing data
// Create a class to find and store JSON data for potential restaurants
class JSONData extends React.Component
{
   constructor(props)
   {
      super(props);
      this.state = {
         searchPlaceIDs: [],
      }
   }

   componentDidMount()
   {
      //// TODO: move this into a URL creator that takes user input
      var placeSearchURL = 'https://cors-anywhere-chance.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 
         'key=AIzaSyDBH1Do7uRmfF54CvPVpZhbka7v4xTaCfI' + 
         '&location=29.632073906038194,-82.3305081265896&radius=2000' + 
         '&type=restaurant&keyword=hispanic';

      // TODO: move this into a function that updates the map when user confirms input
      FetchPlaceSearchJSON(placeSearchURL).then((placeIDs) => {
         console.log('placeIDs = ' + placeIDs.length);
         this.setState({searchPlaceIDs: placeIDs});
      })
      .catch(e => console.log(e));
   }

   render()
   {
      return(
         <ul id = 'placeID'>
            {this.state.searchPlaceIDs.map(list => (<li key={list}>{list}</li>) )}
         </ul>
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


//// TODO: determine if a class or function is better because we aren't storing data
// Store user location and inputs to use for API calls
class UserData extends React.Component
{
   constructor(props)
   {
      super(props);
      this.state = {
         latitude: 0.0,
         longitude: 0.0,
         searchRange: 1000,
         searchKeywords: '',
      }
   }

   componentDidMount()
   {
      //// TODO: move this to user input and run when query made
      GetUserPosition.then((position) => {
         let locationData = [position.coords.latitude, position.coords.longitude];
         console.log(locationData[0] + ', ' + locationData[1]);
         this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
         })
      })
      .catch((err) => {
         console.error(err.message);
      })
   }

   render()
   {
      return(
         <ul id = 'userData'>
            <li>Latitude = {this.state.latitude}</li>
            <li>Longitude = {this.state.longitude}</li>
            <li>Range = {this.state.searchRange}</li>
            <li>Keywords = {this.state.searchKeywords}</li>
         </ul>
      );
   }
}


// Grab the current user location and return a Promise while processing
// https://gist.github.com/varmais/74586ec1854fe288d393
// Removed the options param from example as it was not needed
let GetUserPosition = new Promise( (resolve, reject) => {
   navigator.geolocation.getCurrentPosition(resolve, reject);
});

//// TODO: User this Maps demo to import and display a Google Map

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