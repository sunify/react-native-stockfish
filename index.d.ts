declare module 'react-native-stockfish' {
  import { EventEmitter2 } from 'eventemitter2';

  class Engine extends EventEmitter2 {
    public sendCommand(command: string): void;
    public commit(): void;
    public newGame(): void;
    private ready: Promise<null>;
  }

  export type IInfoResponse = {
    score: ['cp' | 'mate', number],
    multipv: number,
    depth: number,
    time: number,
    nodes: number,
    pv: string,
  };

  export type IBestMoveResponse = {
    bestMove: string,
    ponderMove: string,
  };

  export default new Engine();
}

