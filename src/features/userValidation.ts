import { db } from "../db/db";
import { Events } from "../types";

export const userValidation = ({
  name,
  password,
}: {
  name: string;
  password: string;
}) => {
  const currentUser = db.users.find((user) => user.name === name);
  if (!currentUser) return null;
  if (currentUser.password === password) return null;
  const errorResponse = JSON.stringify({
    type: Events.reg,
    data: JSON.stringify({
      name,
      index: currentUser.id,
      error: true,
      errorText: "wrong password",
    }),
    id: 0,
  });
  return errorResponse;
};
