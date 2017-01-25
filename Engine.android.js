import { NativeModules, DeviceEventEmitter } from 'react-native';
import EngineBase from './EngineBase';
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

function parseIntValue(str, valueKey) {
  const regexp = new RegExp(`\\s${valueKey}\\s(\\d+)`);
  const match = str.match(regexp);
  if (!match) {
    return null;
  }

  return Number(match[1]);
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
    return {
      type: 'info',
      data: {
        multipv: parseIntValue(response, 'multipv'),
        depth: parseIntValue(response, 'depth'),
        seldepth: parseIntValue(response, 'seldepth'),
        nodes: parseIntValue(response, 'nodes'),
        time: parseIntValue(response, 'time'),
        score: parseIntValue(response, 'score cp'),
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

