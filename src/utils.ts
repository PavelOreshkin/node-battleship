import { RawData } from "ws";
import { db } from "./db/db";

export const parseRequest = (request: RawData) => {
  const parsedRequest = JSON.parse(request.toString());
  parsedRequest.data = parsedRequest.data.length
    ? JSON.parse(parsedRequest.data)
    : parsedRequest.data;
  return parsedRequest;
};

export const findCurrentUserByConnectionId = (connectionId: string) => {
  const { users } = db;
  return users.find((user) => user.connectionId === connectionId);
};

export const createInitialBoard = () =>
  Array.from({ length: 10 }, () =>
    Array.from({ length: 10 }, () => ({ isOccupied: false, isShot: false }))
  );
