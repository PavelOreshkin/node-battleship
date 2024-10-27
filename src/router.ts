import { updateRoom, updateWinners } from "./api/forAll";
import { addShips, attack, createGame, startGame, turn } from "./api/game";
import { registration } from "./api/personal";
import { addUserToRoom, createRoom } from "./api/room";
import { checkFinish } from "./checkFinish";
import { Events, RouterType } from "./types";

export const router = async ({
  connectionId,
  parsedRequest,
}: {
  connectionId: string;
  parsedRequest: RouterType;
}): Promise<{
  personalResponses?: string[];
  globalResponses?: string[];
  globalResponsesByCondition?: {
    connectionId: string;
    response: string;
  }[];
}> => {
  try {
    const { type, data } = parsedRequest;

    if (type === Events.reg) {
      const registrationResponse = await registration({
        connectionId,
        user: data,
      });
      const updateRoomResponse = updateRoom();
      const updateWinnersResponse = updateWinners();

      return {
        personalResponses: [registrationResponse],
        globalResponses: [updateRoomResponse, updateWinnersResponse],
      };
    }

    if (type === Events.create_room) {
      createRoom(connectionId);
      const updateRoomResponse = updateRoom();

      return {
        personalResponses: [updateRoomResponse],
        globalResponses: [],
      };
    }

    if (type === Events.add_user_to_room) {
      addUserToRoom({ connectionId, roomId: data.indexRoom });
      const updateRoomResponse = updateRoom();
      const createGameData = createGame(data.indexRoom);

      return {
        globalResponses: [updateRoomResponse].filter(
          (item) => item
        ) as string[],
        globalResponsesByCondition: createGameData,
      };
    }

    if (type === Events.add_ships) {
      addShips(data);
      const startGameData = startGame(data);
      const turnData = startGameData ? turn(connectionId, true) : undefined;

      return {
        globalResponsesByCondition: [
          ...(startGameData ? startGameData : []),
          ...(turnData ? turnData : []),
        ],
      };
    }

    if (type === Events.attack) {
      const attackStructure = attack(data);
      if (!attackStructure) return {};
      const { attackResponse, attackData, isNextTurn } = attackStructure || {};
      const turnData = turn(connectionId, isNextTurn as boolean);
      const gameFinishResponse = checkFinish(connectionId);
      const updateWinnersResponse = updateWinners();
      const updateRoomResponse = updateRoom();

      return {
        globalResponses: gameFinishResponse
          ? [gameFinishResponse, updateWinnersResponse, updateRoomResponse]
          : [],
        globalResponsesByCondition: [
          ...(attackData ? attackData : []),
          ...(turnData ? turnData : []),
        ],
      };
    }

    return {};
  } catch (error) {
    console.error(error);
    return {};
  }
};
