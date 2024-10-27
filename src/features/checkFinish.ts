import { db } from "../db/db";
import { DbType, Events } from "../types";

export const checkFinish = (connectionId: string) => {
  const { games, users } = db;

  const currentGame: DbType["games"][0] = games.reduce((acc, game) => {
    const player = game.players.find(
      (player) => player.connectionId === connectionId
    );
    if (player) {
      return game;
    }
    return acc;
  }, {} as any);
  const currentPlayer: DbType["games"][0]["players"][0] = games.reduce(
    (acc, game) => {
      const player = game.players.find(
        (player) => player.connectionId === connectionId
      );
      if (player) {
        return player;
      }
      return acc;
    },
    {} as any
  );

  const enemyPlayer = currentGame.players.find(
    (player) => player.playerId !== currentPlayer.playerId
  );

  const isGameFinish = !enemyPlayer?.board.some((row) =>
    row.some((cell) => cell.isOccupied && !cell.isShot)
  );

  if (isGameFinish) {
    users.forEach((user) => {
      if (user.connectionId === connectionId) {
        user.wins++;
      }
    });
    const gameIndex = games.findIndex(
      (game) => game.gameId === currentGame.gameId
    );
    games.splice(gameIndex, 1);
  }

  const response = isGameFinish
    ? JSON.stringify({
        type: Events.finish,
        data: JSON.stringify({
          winPlayer: currentPlayer.playerId,
        }),
        id: 0,
      })
    : null;

  return response;
};
