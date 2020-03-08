/*
This components is for logged in users only
*/
import React from "react";
import { Button, View, StyleSheet } from "react-native";

import RootComponent from "../components/RootComponent";
import BodyBold from "../components/UI/BodyBold";
import * as SecureStore from 'expo-secure-store'


class HomeAppScreen extends React.Component {

   deleteFromStore = async (key, value) => {
      await SecureStore.deleteItemAsync(key, value);
   }

   render(){
     return (
       <RootComponent>
         <View style={styles.screen}>

           <BodyBold> You are logged in! Hurray! </BodyBold>


           <BodyBold> Map: </BodyBold>
           <Button
             onPress={() => {
               this.props.navigation.navigate("Map");
             }}
             title="Map"
           />

           <BodyBold> Logout from app! </BodyBold>
           <Button
             onPress={() => {
               this.deleteFromStore("auth_token");
               this.deleteFromStore("user_id");
               this.props.navigation.navigate("Home");
             }}
             title="Logout"
           />

         </View>
       </RootComponent>
     );
  }
};

const styles = StyleSheet.create({
  screen: {
    flex: 1
  }
});

export default HomeAppScreen;
