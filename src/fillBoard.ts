import { DbType, RouterType } from "./types";

export const fillBoard = (
  ships: Extract<RouterType, { type: "add_ships" }>["data"]["ships"],
  board: DbType["games"][0]["players"][0]["board"]
) => {
  ships.forEach((ship) => {
    Array.from({ length: ship.length }).forEach((_, index) => {
      if (ship.direction) {
        board[ship.position.x][ship.position.y + index] = {
          isOccupied: true,
          isShot: false,
        };
        return;
      }
      board[ship.position.x + index][ship.position.y] = {
        isOccupied: true,
        isShot: false,
      };
    });
  });
};
