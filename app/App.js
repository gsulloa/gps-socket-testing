import React from 'react';
import { Platform, StyleSheet, Text, View, TextInput, Button } from 'react-native';
import { Constants, Location, Permissions } from 'expo';
const io = require('socket.io-client');

export default class App extends React.Component {
  state = {
    errorMessage: null,
    location: null,
    socketUrl: "",
    socket: null,
  }

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this.getLocationAsync();
    }
  }

  getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });
  };
  connectToSocket = async () => {
    const url = `http://${this.state.socketUrl}`
    console.log('connect to', url)
    const socket = io(url, {
      transports: ['websocket'],
    });
    socket.on('connect', () => {
      this.setState({ socket });
      this.sendLocationInterval = setInterval(() => {
        socket.emit('new location', this.state.location)
      }, 1000)
    });
  }
  disconnectFromSocket = async () => {
    console.log('disconnect from', this.state.socketUrl)
    this.state.socket.close()
    clearInterval(this.sendLocationInterval)
    this.setState(state => ({
      socket: null,
      socketUrl: "",
    }))
  }

  handleWrite = socketUrl => {
    this.setState(state => ({
      socketUrl,
    }))
  }

  render() {
    let text
    const { location, errorMessage, socketUrl, socket } = this.state
    if (errorMessage) {
      text = errorMessage
    } else if(location) {
      text = JSON.stringify(location, null, 4)
    }
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Socket</Text>
          {socket ? ([
            <Text key="info">Connected to {socketUrl}</Text>,
            <Button title="disconnect" onPress={this.disconnectFromSocket} key="submit"/>
          ]) : ([
            <View style={styles.inputContainer} key="input">
              <Text>URL:  http://</Text>
              <TextInput keyboardType="url" style={styles.input} value={socketUrl} onChangeText={this.handleWrite}/>
            </View>,
            <Button title="connect" onPress={this.connectToSocket} key="submit"/>
          ]
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.title}>Location</Text>
          <Text>info obtained:</Text>
          <Text>{text || "no info :("}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3651e',
    alignItems: 'stretch',
    justifyContent: 'space-between',
    padding: 25,
  },
  card: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: 'center',
  },
  input: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
  }
});
