import { GameState } from './game/gameState';
import { startUi } from './ui/app';

const game = new GameState();

await startUi(game);