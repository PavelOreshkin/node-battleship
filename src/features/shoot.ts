import { db } from "../db/db";
import { DbType, RouterType } from "../types";

const findShipSections = (
  x: number,
  y: number,
  board: DbType["games"][0]["players"][0]["board"]
) => {
  const sections = [];
  const stack = [{ x, y }];
  const visited = new Set();

  while (stack.length) {
    const { x, y } = stack.pop() as { x: number; y: number };
    const key = `${x},${y}`;

    if (
      x < 0 ||
      x >= board.length ||
      y < 0 ||
      y >= board[0].length ||
      visited.has(key)
    ) {
      continue;
    }

    const cell = board[x][y];

    if (cell.isOccupied) {
      sections.push({ x, y, ...cell });
      visited.add(key);

      stack.push(
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 }
      );
    }
  }

  return sections;
};

function findSurroundingCells(
  shipSections: ({
    x: number;
    y: number;
  } & DbType["games"][0]["players"][0]["board"][0][0])[],
  board: DbType["games"][0]["players"][0]["board"]
) {
  const surroundingCells = new Set();

  for (const { x, y } of shipSections) {
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nx = x + dx;
        const ny = y + dy;
        if (
          nx >= 0 &&
          nx < board.length &&
          ny >= 0 &&
          ny < board[0].length &&
          !shipSections.some((section) => section.x === nx && section.y === ny)
        ) {
          surroundingCells.add(JSON.stringify({ x: nx, y: ny }));
        }
      }
    }
  }

  return Array.from(surroundingCells).map((cell) => JSON.parse(cell as string));
}

export const shoot = (
  x: number,
  y: number,
  board: DbType["games"][0]["players"][0]["board"]
) => {
  const {} = db;
  const cell = board[x][y];

  if (x < 0 || x >= 10 || y < 0 || y >= 10) {
    throw new Error("Coordinates outside the board boundaries");
  }

  if (cell.isShot) {
    throw new Error("This cell has already been shot");
  }

  board[x][y].isShot = true;

  if (!cell.isOccupied) {
    return {
      shootResult: [{ position: { x, y }, status: "miss" }],
      isNextTurn: true,
    };
  }

  const shipSections = findShipSections(x, y, board);
  console.log("shoot shipSections: ", shipSections);
  const isShipAlive = shipSections.some((section) => !section.isShot);
  console.log("shoot isShipAlive: ", isShipAlive);

  if (isShipAlive) {
    return {
      shootResult: [{ position: { x, y }, status: "shot" }],
      isNextTurn: false,
    };
  }

  const killedSections = shipSections.map(({ x, y }) => ({
    position: { x, y },
    status: "shot", // TODO должно быть kill
  }));
  console.log("shoot killedSections: ", killedSections);

  const missedCells = findSurroundingCells(shipSections, board).map(
    ({ x, y }) => ({
      position: { x, y },
      status: "miss",
    })
  );
  console.log("shoot missedCells: ", missedCells);
  missedCells.forEach(({ position: { x, y } }) => (board[x][y].isShot = true));

  return {
    shootResult: [...killedSections, ...missedCells],
    isNextTurn: false,
  };
};
