import './App.css';
import React from 'react';
import {Map, GoogleApiWrapper, Marker} from 'google-maps-react';

function App()
{
   return (
      <div className="App">
         <header className="App-header">
            <p>
               Chance A Restaurant!
            </p>
         </header>
         <div className = "App-body">
         </div>
      </div>
   );
}


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

      //// TODO: move this into a function that updates the map when user confirms input
      // FetchPlaceSearchJSON(placeSearchURL).then((placeIDs) => {
      //    console.log("placeIDs = " + placeIDs.length);
      //    this.setState({searchPlaceIDs: placeIDs});
      // })
      // .catch(e => console.log(e));
   }

   render()
   {
      return(
         <ul id = "placeID">
            {this.state.searchPlaceIDs.map(list => (<li>{list}</li>) )}
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
      throw new Error("HTTP error! Status: " + response.status);

   // Parse response to get list of different restaurants
   let myJson = await response.json();
   resultJson = await myJson.results;

   var placeIDs = await ParsePlaceSearchURLJSONForPlaceID(resultJson);

   return placeIDs;   
}


function ParsePlaceSearchURLJSONForPlaceID(resultJson)
{
   var placeIDs = [];
   resultJson.map(place => placeIDs.push(place.place_id));

   return placeIDs
}


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
      navigator.geolocation.getCurrentPosition( position => {
         if (!position.error)
         {
            this.setState({
               latitude: position.coords.latitude,
               longitude: position.coords.longitude
            })
         }
      })
   }

   render()
   {
      return(
         <ul id = "userData">
            <li>Latitude = {this.state.latitude}</li>
            <li>Longitude = {this.state.longitude}</li>
            <li>Range = {this.state.searchRange}</li>
            <li>Keywords = {this.state.searchKeywords}</li>
         </ul>
      );
   }
}




//// TODO: User this Maps demo to import and display a Google Map
const apiKey = 'AIzaSyDBH1Do7uRmfF54CvPVpZhbka7v4xTaCfI';

class SimpleMap extends React.Component
{
   constructor()
   {
      super();
      this.state = {name: "React"};
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
//export default SimpleMap;

export default GoogleApiWrapper({
   apiKey: apiKey
})(SimpleMap);