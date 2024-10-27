import { v4 as uuid } from "uuid";
import { db } from "../db/db";
import { Events, GameState, RouterType } from "../types";
import { findCurrentUserByConnectionId, createInitialBoard } from "../utils";
import { shoot } from "../features/shoot";
import { fillBoard } from "../features/fillBoard";

export const createGame = (roomId: string | number) => {
  const { rooms, games } = db;
  const currentRoom = rooms.find((room) => room.roomId === roomId);
  if (currentRoom && currentRoom?.roomUsers?.length < 2) return;

  const newGameId = uuid();
  const newGame = {
    gameId: newGameId,
    state: GameState.wait,
    turnedPlayerId: currentRoom?.roomUsers[0].id as string | number,
    players: [
      {
        connectionId: currentRoom?.roomUsers[0].connectionId as string,
        playerId: currentRoom?.roomUsers[0].id as string | number,
        ships: [],
        board: createInitialBoard(),
      },
      {
        connectionId: currentRoom?.roomUsers[1].connectionId as string,
        playerId: currentRoom?.roomUsers[1].id as string | number,
        ships: [],
        board: createInitialBoard(),
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

  const gamePlayers = games[gameIndex]?.players;
  const playerIndex = gamePlayers.findIndex(
    (player) => player.playerId === indexPlayer
  );
  gamePlayers[playerIndex].ships = ships;
};

export const startGame = (
  data: Extract<RouterType, { type: "add_ships" }>["data"]
) => {
  const { games } = db;
  const { gameId, ships, indexPlayer } = data;

  const gameIndex = games.findIndex((game) => game.gameId === gameId);
  const currentGame = games[gameIndex];

  const gamePlayers = currentGame.players;
  if (
    gamePlayers.length < 2 ||
    (gamePlayers.length === 2 &&
      gamePlayers.some((player) => player.ships.length === 0))
  ) {
    return;
  }
  games[gameIndex].state = GameState.start;

  gamePlayers.forEach((player) => {
    fillBoard(player.ships, player.board);
  });

  const startGameData = currentGame?.players.map((user) => ({
    connectionId: user.connectionId,
    response: JSON.stringify({
      type: Events.start_game,
      data: JSON.stringify({
        ships: JSON.stringify(user.ships),
        currentPlayerIndex: user.playerId,
      }),
      id: 0,
    }),
  }));
  return startGameData;
};

export const attack = (
  data: Extract<RouterType, { type: "attack" }>["data"]
) => {
  const { games } = db;
  const { gameId, indexPlayer, x, y } = data;
  const currentGame = games.find((game) => game.gameId === gameId);
  if (!currentGame) {
    return null;
  }

  if (currentGame.turnedPlayerId !== indexPlayer) {
    return null;
  }

  const enemyPlayerIndex = currentGame.players.findIndex(
    (player) => player.playerId !== indexPlayer
  );

  const enemyBoard = currentGame.players[enemyPlayerIndex].board;

  const { shootResult, isNextTurn } = shoot(x, y, enemyBoard);

  const attackResponse = shootResult.map((result) =>
    JSON.stringify({
      type: Events.attack,
      data: JSON.stringify({
        ...result,
        currentPlayer: indexPlayer,
      }),
      id: 0,
    })
  );

  const attackData = shootResult.flatMap((result) => {
    return currentGame?.players.map((player) => ({
      connectionId: player.connectionId,
      response: JSON.stringify({
        type: Events.attack,
        data: JSON.stringify({
          ...result,
          currentPlayer: indexPlayer,
        }),
        id: 0,
      }),
    }));
  });

  return { attackResponse, attackData, isNextTurn };
};

export const turn = (connectionId: string, isNextTurn: boolean) => {
  const { games } = db;
  const currentUser = findCurrentUserByConnectionId(connectionId);
  const gameIndex = games.findIndex(
    (game) => game.turnedPlayerId === currentUser?.id
  );
  const currentGame = games[gameIndex];
  if (!currentGame) return null;
  const gameUsers = currentGame.players;
  const currentGameUser = gameUsers.find(
    (user) => user.playerId === currentUser?.id
  );
  const enemyUser = gameUsers.find((user) => user.playerId !== currentUser?.id);

  if (!enemyUser || !currentGameUser) return;

  const nextPlayerTurn = isNextTurn
    ? enemyUser.playerId
    : currentGameUser?.playerId;

  currentGame.turnedPlayerId = nextPlayerTurn;

  const turnData = gameUsers.map((user) => ({
    connectionId: user.connectionId,
    response: JSON.stringify({
      type: Events.turn,
      data: JSON.stringify({ currentPlayer: nextPlayerTurn }),
      id: 0,
    }),
  }));
  return turnData;
};
