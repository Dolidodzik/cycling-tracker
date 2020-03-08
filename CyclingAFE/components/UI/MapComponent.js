import PropTypes from 'prop-types';
import React from 'react';
import { TextInput, StyleSheet, View, Text, ScrollView, FlatList, Slider, TouchableOpacity, Dimensions } from 'react-native';
import { Component } from 'react';
import { Button } from 'react-native-material-ui';
import * as SecureStore from 'expo-secure-store'
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import * as Permissions from 'expo-permissions';
import StarRating from 'react-native-star-rating';
import MapView, { Marker } from 'react-native-maps';
import Fonts from '../../constants/fonts';
import Colors from '../../constants/colors';
import ApiConfig from '../../constants/api';
import BodyBold from "./BodyBold";


export default class MapComponent extends Component {
   constructor(props) {
      super(props);
      this.state = {
         lat: null,
         lon: null,
      };
   }

   componentDidMount = () => { this._getLocationAsync() }

   metersToCoordinatesDistance = (meters) => {
     return meters * 0.000009;
   }

  _getLocationAsync = async () => {
     if(this.props.coords && this.props.coords[0] && this.props.coords[1]){
       this.setState({
          lat: this.props.coords[0],
          lon: this.props.coords[1],
       })
       this.requestSpots(this.props.coords[0], this.props.coords[1], 9999)
     }else{
       let { status } = await Permissions.askAsync(Permissions.LOCATION);
       if (status !== 'granted') {
          this.setState({
             no_posts_to_display: true,
          });
       }
       let location = await Location.getCurrentPositionAsync({});
       this.setState({
          lat: location.coords.latitude,
          lon: location.coords.longitude,
       })
       this.requestSpots(location.coords.latitude, location.coords.longitude, 9999)
     }
  };

  render() {
     if(this.state.lat && this.state.lon){
        return (
           <View>

              <BodyBold> Map: </BodyBold>

              <View style={styles.container}>
                 <MapView
                   style={styles.mapStyle}
                   initialRegion={{
                      latitude: this.state.lat,
                      longitude: this.state.lon,
                      latitudeDelta: this.metersToCoordinatesDistance(100000),
                      longitudeDelta: this.metersToCoordinatesDistance(100000),
                   }}
                 >
                </MapView>

              </View>
           </View>
        );
     }else{
        return ( <Text> Loading </Text> )
     }
  }
}

const styles = StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: '#fff',
     alignItems: 'center',
     justifyContent: 'center',
   },
   mapStyle: {
     width: Dimensions.get('window').width,
     height: Dimensions.get('window').height * 0.75,
   },
});
