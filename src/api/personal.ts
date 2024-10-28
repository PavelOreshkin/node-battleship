import { v4 as uuid } from "uuid";
import { db } from "../db/db";
import { DbType, Events } from "../types";

export const registration = async ({
  connectionId,
  user,
}: {
  connectionId: string;
  user: Pick<DbType["users"][0], "name" | "password">;
}) => {
  const { name, password } = user;

  const currentUser = db.users.find((user) => user.name === name);
  if (currentUser) {
    return JSON.stringify({
      type: Events.reg,
      data: JSON.stringify({
        name,
        index: currentUser.id,
        error: false,
        errorText: "",
      }),
      id: 0,
    });
  }

  const newUserId = uuid();

  const newUser = {
    connectionId,
    id: newUserId,
    name,
    password,
    wins: 0,
  };

  try {
    db.users.push(newUser);
    const successResponse = {
      type: Events.reg,
      data: JSON.stringify({
        index: newUserId,
        name,
        error: false,
        errorText: "",
      }),
      id: 0,
    };
    return JSON.stringify(successResponse);
  } catch (error) {
    const errorResponse = {
      type: Events.reg,
      data: JSON.stringify({
        index: newUserId,
        name,
        error: true,
        errorText: JSON.stringify(error),
      }),
      id: 0,
    };
    return JSON.stringify(errorResponse);
  }
};
