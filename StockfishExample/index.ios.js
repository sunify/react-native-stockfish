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
  View,
  Button,
  NativeModules,
} from 'react-native';
import Engine from 'react-native-stockfish';

export default class StockfishExample extends Component {

  constructor(props) {
    super(props);

    this.state = {
      bestMove: '',
    };

    console.log(NativeModules);
    Engine.on('bestMove', ({ bestMove }) => {
      this.setState({ bestMove });
    });
  }

  handleTestPress() {
    console.log(Engine);
    Engine.sendCommand('position startpos moves e2e4');
    Engine.sendCommand('go depth 10');
    Engine.commit();
  }

  render() {
    return (
      <View style={styles.container}>
        <Button
          title="Test"
          onPress={() => this.handleTestPress()}
          />
        {this.state.bestMove.length > 0 &&
          <Text style={styles.welcome}>
            Best move: {this.state.bestMove}
          </Text>
        }
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
