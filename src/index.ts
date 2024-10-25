import { env } from "node:process";
import { createServer } from "node:http";
import { config as dotenvConfig } from "dotenv";

// dotenvConfig();
// const PORT = Number(env.PORT) || 4000;

const PORT = 4000;

createServer(() => {}).listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
