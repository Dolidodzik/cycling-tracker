import React from "react";
import { Button, View, StyleSheet } from "react-native";
import * as SecureStore from 'expo-secure-store'

import RootComponent from "../components/RootComponent";
import BodyBold from "../components/UI/BodyBold";
import ApiConfig from '../constants/api';
import MapComponent from "../components/UI/MapComponent";


class MapScreen extends React.Component {

   constructor(props){
      super(props);
   }

   render(){
      const coords = this.props.navigation.getParam("coords", null)
      return (
        <RootComponent>
           <View>

             <MapComponent coords={coords}>
             </MapComponent>

             <BodyBold> Want to back to HomeApp? </BodyBold>
             <Button
                onPress={() => {
                   this.props.navigation.navigate("HomeApp");
                }}
                title="Go to HomeApp"
             />

          </View>
       </RootComponent>
     );
   }

};

const styles = StyleSheet.create({
});

export default MapScreen;
