import { NativeModules, DeviceEventEmitter } from 'react-native';
const { Stockfish } = NativeModules;
import EventEmitter from 'eventemitter2';

const parseScore = score => parseInt(score.replace('cp ', ''), 10);

export default class Engine extends EventEmitter {
  constructor() {
    super({});

    DeviceEventEmitter.addListener(`engine_pv`, ({ pv }) => {
      this.emit('pv', pv);
    });

    DeviceEventEmitter.addListener(`engine_bestMove`, ({ bestMove, ponderMove, score }) => {
      this.emit('bestMove', { bestMove, ponderMove, score: parseScore(score) });
    });

    DeviceEventEmitter.addListener(`engine_info`, info => {
      this.emit('info', {
        ...info,
        score: parseScore(info.score),
        pv: info.pv.trim(),
      });
    });

    DeviceEventEmitter.addListener(`engine_searchStats`, ({ searchStats }) => {
      this.emit('searchStats', searchStats);
    });

    DeviceEventEmitter.addListener(`engine_eval`, ({ result }) => {
      this.emit('eval', result);
    });

    this.ready = Stockfish.createEngine();
    this.newGame();
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
    if (command === 'quit' || command === 'stop') {
      Stockfish.stop();
    }
    Stockfish.sendCommand(command);
  }

  async commit() {
    await this.ready;
    Stockfish.commit();
  }

  async stop() {
    await this.ready;
    Stockfish.stop();
  }
}
