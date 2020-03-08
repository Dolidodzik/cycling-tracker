import PropTypes from 'prop-types';
import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { Component } from 'react';
import Fonts from '../../constants/fonts';
import Colors from '../../constants/colors';
import ApiConfig from '../../constants/api';
//import IsLoggedIn from '../utils';

import { Button } from 'react-native-material-ui';
import Form from 'react-native-form';
import { TextField } from 'react-native-material-textfield';
import { withNavigation } from 'react-navigation';
import * as SecureStore from 'expo-secure-store'


class LoginForm extends Component {
   constructor(props) {
      super(props);
      this.state = {
         username: '',
         password: '',
         areCredentialsIncorrect: null,
      };
      this.handleSubmit = this.handleSubmit.bind(this);
   }

   handleUsername = (event) => {
      this.setState({ username: event });
   }
   handlePassword = (event) => {
       this.setState({ password: event.nativeEvent.text });
   }
   setToStore = async (key, value) => {
      await SecureStore.setItemAsync(key, value);
   }
   readFromStore = async (key) => {
      return await SecureStore.getItemAsync(key)
   }

   handleSubmit = async () => {
      fetch(ApiConfig.url + '/api/v0/token_auth/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.state),
      })
      .then((response) => response.json())
      .then((data) => {
         if(data.token){
            this.setToStore("cycling_app_auth_token", data.token)
            global.auth_token = data.token;
            this.props.navigation.navigate("HomeApp");
         }else{
            this.setState({ areCredentialsIncorrect: true })
         }
      })
      .catch((error) => {
        console.error('Error:', error);
      });

   }

   errorMessage() {
      if (this.state.areCredentialsIncorrect) {
         return <Text style = {styles.error_message}> Username or loggin are incorrect! </Text>;
      }
   }

   render() {
      return (
        <View>
            <Form
              ref="form"
              onSubmit={this.handleSubmit}
            >

                 {/* username */}
                 <TextField
                   name="username"
                   label="username"
                   validators={['required']}
                   errorMessages={['This field is required']}
                   placeholder="Your username"
                   type="text"
                   value={ this.state.username }
                   onChangeText={this.handleUsername}
                   style = {styles.input}
                   key = { this.state.username_key }
                 />

                 {/* Passowrd */}
                 <TextField
                   name="password"
                   label="text"
                   placeholder="Your password"
                   secureTextEntry
                   validators={['required']}
                   errorMessages={['This field is required']}
                   type="text"
                   value={this.state.password}
                   onChange={this.handlePassword}
                   style = {styles.input}
                />

                <View>
                  {this.errorMessage()}
                </View>

                <Button primary text="submit" onPress={ this.handleSubmit } />
            </Form>
        </View>
      );
   }
}

export default withNavigation(LoginForm);

const styles = StyleSheet.create({
  input: {
    fontSize: Fonts.InputText.fontSize,
    height: 50,
    borderColor: 'gray',
    borderWidth: 1.5,
    paddingLeft: 20,
    marginBottom: 20,
    backgroundColor: Colors.InputBackground,
  },
  error_message: {
     color: '#BB0000',
     fontSize: 35,
  },
  wrapper: {
    backgroundColor: Colors.primary,
  }
});
