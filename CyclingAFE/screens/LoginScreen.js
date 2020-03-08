import React, { Component } from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';

import RootComponent from "../components/RootComponent";
import BodyBold from "../components/UI/BodyBold";
import LoginForm from "../components/UI/LoginForm";
import BigHeader from "../components/UI/BigHeader";


const LoginScreen = props => {
   return (
     <RootComponent>

       <BigHeader> Login </BigHeader>
       <LoginForm>
       </LoginForm>

     </RootComponent>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    marginTop: 50,
    marginLeft: 20,
    marginRight: 20,
    backgroundColor: '#ffffff',
    textAlign: 'center',
  },
});

export default LoginScreen;
