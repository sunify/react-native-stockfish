import { NativeModules, DeviceEventEmitter } from 'react-native';
import EngineBase from './EngineBase';
import parseIntValue from './parseIntValue';
const { Stockfish } = NativeModules;

const parseScore = score => {
  const cpScore = parseIntValue(` ${score}`, 'cp');
  const mateScore = parseIntValue(` ${score}`, 'mate');
  return cpScore ? ['cp', cpScore] : ['mate', mateScore];
};

export default class Engine extends EngineBase {
  constructor() {
    super();

    DeviceEventEmitter.addListener(`engine_pv`, ({ pv }) => {
      this.emit('pv', pv);
    });

    DeviceEventEmitter.addListener(`engine_bestMove`, ({ bestMove, ponderMove, score }) => {
      this.emit('bestMove', { bestMove, ponderMove });
    });

    DeviceEventEmitter.addListener(`engine_info`, info => {
      const cpScore = 
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
  }

  sendCommand(command) {
    if (command === 'quit' || command === 'stop') {
      Stockfish.stop();
    }
    super.sendCommand(command);
  }

  async stop() {
    await this.ready;
    Stockfish.stop();
  }
}
