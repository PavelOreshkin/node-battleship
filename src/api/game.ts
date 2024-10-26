import { v4 as uuid } from "uuid";
import { db } from "../db";
import { Events, GameState, RouterType } from "../types";

export const createGame = (roomId: string | number) => {
  const { rooms, games } = db;
  const currentRoom = rooms.find((room) => room.roomId === roomId);
  if (currentRoom && currentRoom?.roomUsers?.length < 2) return;

  const newGameId = uuid();
  const newGame = {
    gameId: newGameId,
    state: GameState.wait,
    players: [
      {
        connectionId: currentRoom?.roomUsers[0].connectionId as string,
        playerId: currentRoom?.roomUsers[0].id as string | number,
        ships: [],
      },
      {
        connectionId: currentRoom?.roomUsers[1].connectionId as string,
        playerId: currentRoom?.roomUsers[1].id as string | number,
        ships: [],
      },
    ],
  };

  games.push(newGame);
  const roomIndex = rooms.findIndex((room) => room.roomId === roomId);
  rooms.splice(roomIndex, 1);

  const createGameData = currentRoom?.roomUsers.map((user) => ({
    connectionId: user.connectionId,
    response: JSON.stringify({
      type: Events.create_game,
      data: JSON.stringify({
        idGame: newGameId,
        idPlayer: user?.id,
      }),
      id: 0,
    }),
  }));

  return createGameData;
};

export const addShips = (
  data: Extract<RouterType, { type: "add_ships" }>["data"]
) => {
  const { games } = db;
  const { gameId, ships, indexPlayer } = data;

  const gameIndex = games.findIndex((game) => game.gameId === gameId);

  const gamePlyers = games[gameIndex]?.players;
  const playerIndex = gamePlyers.findIndex(
    (player) => player.playerId === indexPlayer
  );
  gamePlyers[playerIndex].ships = ships;
};

export const startGame = (
  data: Extract<RouterType, { type: "add_ships" }>["data"]
) => {
  const { games } = db;
  const { gameId, ships, indexPlayer } = data;

  const gameIndex = games.findIndex((game) => game.gameId === gameId);
  const currentGame = games[gameIndex];

  const gamePlyers = currentGame.players;
  if (
    gamePlyers.length < 2 ||
    (gamePlyers.length === 2 &&
      gamePlyers.some((player) => player.ships.length === 0))
  ) {
    return;
  }
  games[gameIndex].state = GameState.start;

  const startGameData = currentGame?.players.map((user) => ({
    connectionId: user.connectionId,
    response: JSON.stringify({
      type: Events.start_game,
      data: JSON.stringify({
        ships: JSON.stringify(ships),
        currentPlayerIndex: indexPlayer,
      }),
      id: 0,
    }),
  }));
  return startGameData;
};
