import { NativeModules, DeviceEventEmitter } from 'react-native';
import EngineBase from './EngineBase';
import parseIntValue from './parseIntValue';
const { Stockfish } = NativeModules;

export default class Engine extends EngineBase {
  constructor() {
    super();

    DeviceEventEmitter.addListener('engine_data', data => {
      const response = parseEngineReponse(data);

      switch (response.type) {
        case 'bestMove':
          this.emit('bestMove', {
            bestMove: response.data.bestmove,
            ponderMove: response.data.ponder,
          });
          break;
        case 'info':
          this.emit('info', response.data);
          break;

        /**
         * For consistency with ios need emitters for:
         * pv
         * eval
         * searchStats
         */
      }
    });
  }
}

function parsePv(info) {
  const match = info.match(/\spv\s(.*)$/);
  if (!match) {
    return null;
  }

  return match[1];
}

function parseEngineReponse(response) {
  if (response.startsWith('bestmove')) {
    const parts = response.split(' ');
    return {
      type: 'bestMove',
      data: {
        bestmove: parts[1],
        ponder: parts[3],
      }
    };
  } else if (response.startsWith('info')) {
    const cpScore = parseIntValue(response, 'score cp');
    const mateScore = parseIntValue(response, 'score mate');
    return {
      type: 'info',
      data: {
        multipv: parseIntValue(response, 'multipv'),
        depth: parseIntValue(response, 'depth'),
        seldepth: parseIntValue(response, 'seldepth'),
        nodes: parseIntValue(response, 'nodes'),
        time: parseIntValue(response, 'time'),
        score: cpScore ? ['cp', cpScore] : ['mate', mateScore],
        pv: parsePv(response),
      },
    };
  } else {
    return {
      type: 'unknown',
      data: response,
    };
  }
}

