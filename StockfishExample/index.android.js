/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  NativeModules,
  View,
  DeviceEventEmitter
} from 'react-native';

const { Stockfish } = NativeModules;

export default class StockfishExample extends Component {
  render() {
    Stockfish.startEngine();
    Stockfish.sendCommand('stop');
    Stockfish.sendCommand('uci');
    Stockfish.sendCommand('debug on');
    Stockfish.sendCommand('isready');
    Stockfish.sendCommand('ucinewgame');
    Stockfish.sendCommand('setoption name Ponder value false');
    Stockfish.sendCommand('position startpos moves e2e4 e7e5');
    Stockfish.sendCommand('go depth 5');
    DeviceEventEmitter.addListener('engine_data', data => {
      console.log('from engine', data);
    });
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.android.js
        </Text>
        <Text style={styles.instructions}>
          Double tap R on your keyboard to reload,{'\n'}
          Shake or press menu button for dev menu
        </Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('StockfishExample', () => StockfishExample);
