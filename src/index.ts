import WebSocket, { WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";
import { parseRequest } from "./utils";
import { router } from "./router";
import { db } from "./db";

// dotenvConfig();
// const PORT = Number(env.PORT) || 4000;
const PORT = 3000;

interface CustomWebSocket extends WebSocket {
  id: string;
}

const wss = new WebSocketServer({ port: PORT }, () => {
  console.log(`Server is running on port ${PORT}`);
});

wss.on("connection", function connection(ws) {
  const wsWithId = ws as CustomWebSocket;
  wsWithId.id = uuid();
  wsWithId.on("error", console.error);

  wsWithId.on("message", async function message(request) {
    const parsedRequest = parseRequest(request);
    console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>");
    console.log("connectionId: ", wsWithId.id);
    console.log("parsedRequest: ", parsedRequest);

    const responses: {
      personalResponses?: string[];
      globalResponses?: string[];
      globalResponsesByCondition?: {
        connectionId: string;
        response: string;
      }[];
    } = await router({ connectionId: wsWithId.id, parsedRequest });
    responses.personalResponses?.forEach((response) => wsWithId.send(response));

    if (responses.globalResponses && responses.globalResponses.length > 0) {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          responses.globalResponses?.forEach((response) => {
            client.send(response);
          });
        }
      });
    }

    if (
      responses.globalResponsesByCondition &&
      responses.globalResponsesByCondition.length > 0
    ) {
      wss.clients.forEach((client) => {
        const customCLient = client as CustomWebSocket;
        if (customCLient.readyState === WebSocket.OPEN) {
          responses?.globalResponsesByCondition?.forEach(
            ({ connectionId, response }) => {
              if (customCLient?.id === connectionId) {
                customCLient.send(response);
              }
            }
          );
        }
      });
    }
    console.dir(db, { depth: null, colors: true });
    console.log("----------------------------------");
  });
});
