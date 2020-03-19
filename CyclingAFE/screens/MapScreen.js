import React from 'react';
import { EventEmitter } from 'fbemitter';
import { NavigationEvents } from 'react-navigation';
import { AppState, AsyncStorage, Platform, StyleSheet, Text, View, Button } from 'react-native';
import MapView from 'react-native-maps';
import * as Permissions from 'expo-permissions';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons';
import ApiConfig from '../constants/api';

const STORAGE_KEY = 'expo-home-locations';
const LOCATION_UPDATES_TASK = 'location-updates';

const locationEventsEmitter = new EventEmitter();

export default class MapScreen extends React.Component {
  static navigationOptions = {
    title: 'Background location',
  };

  mapViewRef = React.createRef();

  constructor(props){
    super(props)
    this.already_sent_points = 0;
    this.clearLocations();
  }

  state = {
    accuracy: 4,
    isTracking: false,
    showsBackgroundLocationIndicator: false,
    savedLocations: [],
    initialRegion: null,
    error: null,
    start_timestamp: null,
    current_timestamp: null,
  };

  didFocus = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);

    if (status !== 'granted') {
      AppState.addEventListener('change', this.handleAppStateChange);
      this.setState({
        error:
          'Location permissions are required in order to use this feature. You can manually enable them at any time in the "Location Services" section of the Settings app.',
      });
      return;
    } else {
      this.setState({ error: null });
    }

    const { coords } = await Location.getCurrentPositionAsync();
    const isTracking = await Location.hasStartedLocationUpdatesAsync(LOCATION_UPDATES_TASK);
    const task = (await TaskManager.getRegisteredTasksAsync()).find(
      ({ taskName }) => taskName === LOCATION_UPDATES_TASK
    );
    const savedLocations = await getSavedLocations();
    const accuracy = (task && task.options.accuracy) || this.state.accuracy;

    this.eventSubscription = locationEventsEmitter.addListener('update', locations => {
      this.setState({ savedLocations: locations });
    });

    if (!isTracking) {
      alert('Click `Start tracking` to start getting location updates.');
    }

    this.setState({
      accuracy,
      isTracking,
      savedLocations,
      initialRegion: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.002,
      },
    });
  };

  handleAppStateChange = nextAppState => {
    if (nextAppState !== 'active') {
      return;
    }

    if (this.state.initialRegion) {
      AppState.removeEventListener('change', this.handleAppStateChange);
      return;
    }

    this.didFocus();
  };

  componentDidMount() {
    this.interval = setInterval(() => this.setState({ current_timestamp: Date.parse(new Date())/1000 }), 1000);
  }
  componentWillUnmount() {
    if (this.eventSubscription) {
      this.eventSubscription.remove();
    }
    AppState.removeEventListener('change', this.handleAppStateChange);
  }

  async startLocationUpdates(accuracy = this.state.accuracy) {
    await Location.startLocationUpdatesAsync(LOCATION_UPDATES_TASK, {
      accuracy,
      showsBackgroundLocationIndicator: this.state.showsBackgroundLocationIndicator,
    });

    if (!this.state.isTracking) {
      alert(
        'Now you can send app to the background, go somewhere and come back here! You can even terminate the app and it will be woken up when the new significant location change comes out.'
      );
    }
    this.setState({ isTracking: true });
  }

  async stopLocationUpdates() {
    await Location.stopLocationUpdatesAsync(LOCATION_UPDATES_TASK);
    this.setState({ isTracking: false });
  }

  clearLocations = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    this.setState({ savedLocations: [] });
  };

  toggleTracking = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);

    // Clear trip if some somehow is in progress now
    fetch(ApiConfig.url + '/api/v0/core/trips/0/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Token ' + global.auth_token,
      },
    })
    .then((response) => response.json())
    .then((data) => {
    }).catch((error) => {
      //console.error('Error:', error);
    });


    if (this.state.isTracking) {
      await this.stopLocationUpdates();
      this.setState({ start_timestamp: null })

      // sending whole previously saved locations
      let { savedLocations } = this.state;
      if(savedLocations.length){
        const locations_json_string = JSON.stringify(savedLocations);
        fetch(ApiConfig.url + '/api/v0/receivepoints/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Token ' + global.auth_token,
          },
          body: locations_json_string,
        })
        .then((response) => response.json())
        .then((data) => {
        })
      }

    } else {
      await this.startLocationUpdates();
      this.setState({ start_timestamp: Date.parse(new Date())/1000 })
      global.is_paused = false;

      fetch(ApiConfig.url + '/api/v0/core/trips/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Token ' + global.auth_token,
        },
        body: JSON.stringify({"owner": global.id})
      })
      .then((response) => response.json())
      .then((data) => {
        global.trip_id = data.id;
      })
    }

    this.setState({ savedLocations: [] });
    this.clearLocations();

  };

  toggleLocationIndicator = async () => {
    const showsBackgroundLocationIndicator = !this.state.showsBackgroundLocationIndicator;

    this.setState({ showsBackgroundLocationIndicator }, async () => {
      if (this.state.isTracking) {
        await this.startLocationUpdates();
      }
    });
  };

  onCenterMap = async () => {
    const { coords } = await Location.getCurrentPositionAsync();
    const mapView = this.mapViewRef.current;

    if (mapView) {
      mapView.animateToRegion({
        latitude: coords.latitude,
        longitude: coords.longitude,
        latitudeDelta: 0.004,
        longitudeDelta: 0.002,
      });
    }
  };

  timer = () => {
    if(this.state.start_timestamp==null)
      return "00:00:00";
    const seconds = this.state.current_timestamp - this.state.start_timestamp;
    return new Date(seconds * 1000).toISOString().substr(11, 8)
  }

  pause = () => {
    global.is_paused = !global.is_paused
    this.setState({ state: this.state });
  }

  request = async (ignore_send_before=false) => {
    try {
      let { savedLocations } = this.state;
      const frequency_of_sending = 3;

      if(savedLocations.length % frequency_of_sending == 0){
        // cutting saved locations to not send the same more than 1 time
        if(savedLocations.length && this.already_sent_points){
          savedLocations = savedLocations.slice(Math.max(this.already_sent_points, 0))
        }

        if(savedLocations.length){
          const locations_json_string = JSON.stringify(savedLocations);
          fetch(ApiConfig.url + '/api/v0/receivepoints/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Token ' + global.auth_token,
            },
            body: locations_json_string,
          })
          .then((response) => response.json())
          .then((data) => {
            if(data == "POST_RESPONSE"){
              this.already_sent_points = this.already_sent_points + frequency_of_sending
            }
          })
        }
      }
    } catch(error) {
      console.log("ERROR!!!")
    }
  }

  renderPolyline() {
    // sending points data to BE
    this.request()

    // Standard polyline render
    let { savedLocations } = this.state;
    if (savedLocations.length === 0) {
      return null;
    }
    return (
      <MapView.Polyline
        coordinates={savedLocations}
        strokeWidth={3}
        strokeColor={"black"}
      />
    );
  }

  render() {
    if (this.state.error) {
      return <Text style={styles.errorText}>{this.state.error}</Text>;
    }

    if (!this.state.initialRegion) {
      return <NavigationEvents onDidFocus={this.didFocus} />;
    }

    return (
      <View style={styles.screen}>
        <MapView
          ref={this.mapViewRef}
          style={styles.mapView}
          initialRegion={this.state.initialRegion}
          showsUserLocation>
          {this.renderPolyline()}
        </MapView>
        <View style={styles.buttons} pointerEvents="box-none">
          <View style={styles.topButtons}>
            <View style={styles.buttonsColumn}>
              {Platform.OS === 'android' ? null : (
                <Button style={styles.button} onPress={this.toggleLocationIndicator} title="background/indicator">
                  <Text>{this.state.showsBackgroundLocationIndicator ? 'Hide' : 'Show'}</Text>
                  <Text> background </Text>
                  <FontAwesome name="location-arrow" size={20} color="white" />
                  <Text> indicator</Text>
                </Button>
              )}
            </View>
            <View style={styles.buttonsColumn}>
              <Button style={styles.button} onPress={this.onCenterMap} title="my location">
                <MaterialIcons name="my-location" size={20} color="white" />
              </Button>
            </View>
          </View>

          <View style={styles.bottomButtons}>
            <Button style={styles.button} onPress={this.clearLocations} title="clear locations">
              Clear locations
            </Button>
            <Button style={styles.button} onPress={this.pause} title={"Pause: "+global.is_paused}>
              Pause
            </Button>
            <Button style={styles.button} onPress={this.toggleTracking} title={"start-stop tracking, is-tracking: "+this.state.isTracking+" timer: "+this.timer()}>
              {this.state.isTracking ? 'Stop tracking' : 'Start tracking'}
            </Button>
          </View>
        </View>
      </View>
    );
  }
}

async function getSavedLocations() {
  try {
    const item = await AsyncStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (e) {
    return [];
  }
}

TaskManager.defineTask(LOCATION_UPDATES_TASK, async ({ data: { locations } }) => {
  if (locations && locations.length > 0) {
    const savedLocations = await getSavedLocations();
    const newLocations = locations.map(({ coords }) => ({
      latitude: coords.latitude,
      longitude: coords.longitude,
      timestamp: Date.parse(new Date()),
      trip: global.trip_id,
      was_paused: global.is_paused,
    }));

    savedLocations.push(...newLocations);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(savedLocations));

    locationEventsEmitter.emit('update', savedLocations);
  }
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  mapView: {
    flex: 1,
  },
  buttons: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  topButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomButtons: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  buttonsColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  button: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  errorText: {
    fontSize: 15,
    color: 'rgba(0,0,0,0.7)',
    margin: 20,
  },
});
