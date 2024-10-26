import { db } from "../db";
import { Events } from "../types";

export const updateWinners = () => {
  const { users } = db;
  try {
    const winnersTable = users
      .filter(({ wins }) => wins > 0)
      .map(({ name, wins }) => ({ name, wins }))
      .sort((a, b) => b.wins - a.wins);
    const successResponse = {
      type: Events.update_winners,
      data: JSON.stringify(winnersTable),
      id: 0,
    };
    return JSON.stringify(successResponse);
  } catch (error) {
    console.log("error: ", error);
    return JSON.stringify(error);
  }
};

export const updateRoom = () => {
  const { rooms } = db;

  const preparedRooms = rooms.map((room) => ({
    roomId: room.roomId,
    roomUsers: room.roomUsers.map((user) => ({
      name: user.name,
      index: user.id,
    })),
  }));

  const response = {
    type: Events.update_room,
    data: JSON.stringify(preparedRooms),
    id: 0,
  };
  return JSON.stringify(response);
};
