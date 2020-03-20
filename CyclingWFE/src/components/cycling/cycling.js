import React, {Component} from 'react';
import './cycling.css'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

// Creating custom Marker
import L from 'leaflet';
const MarkerIcon = new L.Icon({
    iconUrl: require('./marker.png'),
    iconSize: new L.Point(15, 15),
});


export default class cycling extends Component {
    constructor(props) {
      super(props);
      this.state = {
        data: null,
        points: null,
      };
      this.requestCurrentlyActiveTrip();
      this.interval = setInterval(() => this.requestCurrentlyActiveTrip(), 15000/*1000*60*3*/);
    }

    requestCurrentlyActiveTrip(){
      // Getting basic data
      console.log("call trip")
      fetch("http://localhost:8000/api/v0/core/trips/0/?search_for_currently_active_trip=true")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ data:data })
        if(this.state.data.id){
          this.requestPoints()
        }
      })
    }

    requestPoints(){
      // Getting points data
      console.log("call points")
      let last_point_timestamp = 0
      if(this.state.points && this.state.points[0]){
        last_point_timestamp = this.state.points[0].timestamp;
      }

      fetch("http://localhost:8000/api/v0/core/points/?trip="+this.state.data.id)
      .then((response) => response.json())
      .then((data) => {
        // if some points was saved before just concatenate
        if(this.state.points){
          this.setState({
            points: this.state.points.concat(data),
          })
        }else{
          this.setState({points:data})
        }
      })
    }

    createMarkers(){
      let points = []
      this.state.points.forEach(function (point, i) {
        points.push(
          <Marker position={[point.lat, point.lon]} icon={MarkerIcon} key={i}>
            <Popup>
              Time: {new Date(point.timestamp).toISOString().substr(11, 8)}
            </Popup>
          </Marker>
        )
      });
      return points
    }

    renderMap(){

      return (
        <Map
          center={[ this.state.points[this.state.points.length-1].lat  , this.state.points[this.state.points.length-1].lon ]}
          zoom={17}
          attributionControl={true}
          zoomControl={true}
          doubleClickZoom={true}
          scrollWheelZoom={true}
          dragging={true}
          animate={true}
          easeLinearity={0.35}
        >
          <TileLayer
            url='http://{s}.tile.osm.org/{z}/{x}/{y}.png'
          />
          {this.createMarkers()}
        </Map>
      )
    }

    render() {
      // shortin syntax
      const d = this.state.data
      if(this.state.data && this.state.points ){
        return (
          <div className="component-cycling">
            Started at: {d.created_date} <br/>
            Number of recorded locations: {d.number_of_points} <br/>
            Time cycling: {new Date(d.time * 1000).toISOString().substr(11, 8)} <br/>
            Avarage speed: {d.avg_speed} KM/H <br/>
            Distance: {d.distance/1000}KM <br/>
            {this.renderMap()}
          </div>
        );
      }else{
        return (
          <div className="component-cycling">
            loading
          </div>
        );
      }
    }
  }
