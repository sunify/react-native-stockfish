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
  TextInput,
  ScrollView,
  Button,
  NativeModules,
} from 'react-native';
import Engine from 'react-native-stockfish';

// Engine.on('pv', pv => console.log('pv', pv));
// Engine.on('bestMove', moves => {
//   console.log('bestMove', moves);
// });
// Engine.on('eval', result => {
//   console.log(result);
// });

export default class App extends Component {

  state = {
    depth: 0,
    score: 0,
    moves: '',
    baseTurn: 'w',
    info: [{ score: 0, pv: ''}, { score: 0, pv: ''}, { score: 0, pv: ''}],
  };

  constructor() {
    super();

    Engine.on('info', info => {
      const i = info.multipv - 1;
      const nextInfo = [...this.state.info];
      nextInfo[i] = {
        ...info,
        score: this.score(info.score),
      };
      this.setState({
        info: nextInfo,
        depth: info.depth,
      });

      if (i === 0) {
        this.setState({
          score: this.score(info.score),
        });
      }
    });

    Engine.on('bestMove', ({bestMove, score}) => {
      this.setState(state => ({
        moves: state.moves + ' ' + bestMove,
      }));
    });
  }

  handleAnalyze() {
    this.setState(state => ({
      baseTurn: (state.moves.split(' ').length % 2) ? 'w' : 'b',
    }));
    Engine.sendCommand(`position startpos moves ${this.state.moves}`);
    Engine.sendCommand('setoption name Skill Level value 20');
    Engine.sendCommand('setoption name MultiPV value 3');
    Engine.sendCommand('go mindepth 8 movetime 30000');
    Engine.commit();
  }

  handleStop() {
    Engine.sendCommand('stop');
    Engine.commit();
  }

  score(score) {
    const { baseTurn } = this.state;
    return ((baseTurn === 'b') ? -1 : 1) * score / 100;
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>
          Score: {this.state.score} |
          Depth: {this.state.depth}
        </Text>
        <ScrollView
          automaticallyAdjustContentInsets={false}
          horizontal
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
          }}
          contentContainerStyle={{
            flexDirection: 'column',
            padding: 10,
          }}
        >
          {this.state.info.map((info, i) =>
            <View key={i} style={{
              
            }}>
              <Text>
                <Text style={{ fontWeight: 'bold' }}>
                  {info.score}
                </Text> {info.pv}
              </Text>
            </View>
          )}
        </ScrollView>
        <TextInput
          style={{
            width: 300,
            height: 200,
            backgroundColor: '#fff',
            borderColor: '#ccc',
            borderWidth: 1,
          }}
          multiline
          value={this.state.moves}
          onChangeText={moves => this.setState({ moves })}
          autoCapitalize="none"
          />
        <Button
          onPress={() => this.handleAnalyze()}
          title="Analyze"
          />
        <Button
          onPress={() => this.handleStop()}
          title="Stop"
          />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
    paddingTop: 50,
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