import { updateRoom, updateWinners } from "./api/forAll";
import { addShips, createGame, startGame } from "./api/game";
import { registration } from "./api/personal";
import { addUserToRoom, createRoom } from "./api/room";
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
      globalResponses: [updateRoomResponse].filter((item) => item) as string[],
      globalResponsesByCondition: createGameData,
    };
  }

  if (type === Events.add_ships) {
    addShips(data);
    const startGameData = startGame(data);
    console.dir(startGameData, { depth: null, colors: true });

    return {
      globalResponsesByCondition: startGameData,
    };
  }

  return {};
};
