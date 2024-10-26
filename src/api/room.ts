import { v4 as uuid } from "uuid";
import { db } from "../db";
import { findCurrentUserByConnectionId } from "../utils";

export const createRoom = (connectionId: string) => {
  const { rooms } = db;
  const currentUser = findCurrentUserByConnectionId(connectionId);
  // TODO проверить
  if (!currentUser) throw new Error("You must be logged in to create a room");

  const newRooms = {
    roomId: uuid(),
    roomUsers: [currentUser],
  };
  rooms.push(newRooms);
};

export const addUserToRoom = ({
  connectionId,
  roomId,
}: {
  connectionId: string;
  roomId: string | number;
}) => {
  const { rooms } = db;
  const currentUser = findCurrentUserByConnectionId(connectionId);
  // TODO проверить
  if (!currentUser) throw new Error("You must be logged in to create a room");
  const roomIndex = rooms.findIndex((room) => room.roomId === roomId);
  rooms[roomIndex].roomUsers.push(currentUser);
};
