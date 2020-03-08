// This is our main navigation i have simply provided stack navigation example. You can add what ever requirement you have here
import {
    // createStackNavigator,
    createAppContainer,
} from "react-navigation";

import { createStackNavigator } from "react-navigation-stack";

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import HomeAppScreen from '../screens/HomeAppScreen';
import MapScreen from '../screens/MapScreen';

const defaultNav = {
  header: null
};

const homeStackNav  = createStackNavigator({
    Home:HomeScreen,
    Login: LoginScreen,
    HomeApp: HomeAppScreen,
    Map:MapScreen,
},{
  defaultNavigationOptions: defaultNav,
})

export default createAppContainer(homeStackNav);
