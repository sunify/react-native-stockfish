import { NativeModules, DeviceEventEmitter } from 'react-native';
const { Stockfish } = NativeModules;
import EventEmitter from 'eventemitter2';

export default class EngineBase extends EventEmitter {
  constructor() {
    super({});
    this.newGame();
    this.ready = Stockfish.createEngine();
  }

  async newGame() {
    await this.ready;
    Stockfish.sendCommand('stop');
    Stockfish.sendCommand('uci');
    Stockfish.sendCommand('debug on');
    Stockfish.sendCommand('isready');
    Stockfish.sendCommand('ucinewgame');
    Stockfish.sendCommand('setoption name Ponder value false');
  }

  async sendCommand(command) {
    await this.ready;
    Stockfish.sendCommand(command);
  }

  async commit() {
    await this.ready;
    Stockfish.commit();
  }
}
