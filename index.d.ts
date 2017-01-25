import { EventEmitter2 } from 'eventemitter2';

declare module 'react-native-stockfish' {
  class Engine extends EventEmitter2 {
    public sendCommand(command: string): void;
    public commit(): void;
    public newGame(): void;
    private ready: Promise<null>;
  }
}

export default new Engine();
