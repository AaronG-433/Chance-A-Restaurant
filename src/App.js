import logo from './logo.svg';
import './App.css';
import React from 'react';

function App()
{
   return (
      <div className="App">
         <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
               Edit <code>src/App.js</code> and save to reload.
            </p>
            <p>Hello</p>
            <a
               className="App-link"
               href="https://reactjs.org"
               target="_blank"
               rel="noopener noreferrer"
            >
               Learn React
            </a>
            <JSONData />
         </header>
      </div>
   );
}

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
      var placeSearchURL = 'https://cors-anywhere-chance.herokuapp.com/https://maps.googleapis.com/maps/api/place/nearbysearch/json?' + 
         'key=AIzaSyDBH1Do7uRmfF54CvPVpZhbka7v4xTaCfI' + 
         '&location=29.632073906038194,-82.3305081265896&radius=2000' + 
         '&type=restaurant&keyword=hispanic';
      
      FetchPlaceSearchJSON(placeSearchURL).then((placeIDs) => {
         console.log("placeIDs = " + placeIDs.length);
         this.setState({searchPlaceIDs: placeIDs});
      })
      .catch(e => console.log(e));
   }

   render()
   {
      return(
         <ul>
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

export default App;
