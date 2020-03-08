import React from "react";
import { Button, View, StyleSheet } from "react-native";

import RootComponent from "../components/RootComponent";
import BodyBold from "../components/UI/BodyBold";
import ApiConfig from '../constants/api';
import * as SecureStore from 'expo-secure-store'


class HomeScreen extends React.Component {

   constructor(props) {
      super(props);
      global.navigation = this.props.navigation;
      this.checkToken();
   }

   checkToken = async () => {
      const token = await SecureStore.getItemAsync("cycling_app_auth_token")
      if(token){
        await fetch(ApiConfig.url + '/api/v0/core/user_id/', {
          headers: {
            'Authorization': 'Token ' + token,
            'Content-Type': 'application/json',
          }
        })
        .then((response) => response.json())
        .then((data) => {
           if (data[0] && data[0].id){
              global.id = data[0].id;
              global.auth_token = token;
              this.props.navigation.navigate("HomeApp");
           }
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      }
   }

   render(){
      return (
        <RootComponent>
          <View style={styles.screen}>

           <BodyBold> Login </BodyBold>
           <Button
              onPress={() => {
                 this.props.navigation.navigate("Login");
              }}
              title="Go to login"
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

export default HomeScreen;
