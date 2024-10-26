export enum Events {
  reg = "reg",
  create_room = "create_room",
  add_user_to_room = "add_user_to_room",
  add_ships = "add_ships",
  attack = "attack",
  randomAttack = "randomAttack",
  finish = "finish",
  update_room = "update_room",
  update_winners = "update_winners",
  create_game = "create_game",
  start_game = "start_game",
}

export type RouterType =
  | { type: Events.reg; data: { name: string; password: string }; id: number }
  | { type: Events.create_room; data: ""; id: number }
  | {
      type: Events.add_user_to_room;
      data: { indexRoom: number | string };
      id: number;
    }
  | {
      type: Events.add_ships;
      data: {
        gameId: number | string;
        ships: Array<{
          position: { x: number; y: number };
          direction: boolean;
          length: number;
          type: "small" | "medium" | "large" | "huge";
        }>;
        indexPlayer: number | string;
      };
      id: number;
    }
  | {
      type: Events.attack;
      data: {
        gameId: number | string;
        x: number;
        y: number;
        indexPlayer: number | string;
      };
      id: number;
    }
  | {
      type: Events.randomAttack;
      data: { gameId: number | string; indexPlayer: number | string };
      id: number;
    }
  | {
      type: Events.finish;
      data: { winPlayer: number | string };
      id: number;
    };

export enum GameState {
  wait = "wait",
  start = "start",
}

type User = {
  connectionId: string;
  id: string;
  name: string;
  password: string;
  wins: number;
};

export type DbType = {
  users: User[];
  rooms: {
    roomId: number | string;
    roomUsers: User[];
  }[];
  games: {
    gameId: number | string;
    state: GameState;
    players: {
      connectionId: string;
      playerId: number | string;
      ships: {
        position: { x: number; y: number };
        direction: boolean;
        length: number;
        type: "small" | "medium" | "large" | "huge";
      }[];
    }[];
  }[];
};
