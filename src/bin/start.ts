import path from "path";
import express, { Router } from "express";
import pino from "pino";
import pinoLoggerMiddleware from "express-pino-logger";
import bodyParser from "body-parser";
import { registerHandlers } from "register-server-handlers";
import { config } from "../config.js";
import { healthcheck } from "../lib/healthcheck.js";

const { port, handlerBasePath } = config;
const handlersPath = path.resolve(process.cwd(), handlerBasePath, "handlers");

const logger = pino();
const pinoLogger = pinoLoggerMiddleware({ logger });
const server = express();

const healthRouter = Router();
const appRouter = Router();

let listeningServer;

// parse application/x-www-form-urlencoded
server.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
server.use(bodyParser.json());

// enable request logging
appRouter.use(pinoLogger);

export const start = async (server, handlersPath: string) => {
  healthRouter.get("/", healthcheck);
  server.use("/health", healthRouter);

  logger.info(`⏳ registering server handlers from ${handlersPath}`);
  // register handlers as HTTP Post handlers
  await registerHandlers({
    server: appRouter,
    path: handlersPath,
    handlerOptions: {
      sync: true,
    },
  });

  logger.info(
    `⏳ registering server cloud event handlers from ${handlersPath}`
  );
  // register handlers as KNative Cloud Event Handlers
  await registerHandlers({
    server: appRouter,
    path: handlersPath,
    cloudevents: true,
    serverPath: "/cloudevent/",
    handlerOptions: {
      sync: false,
    },
  });

  server.use("/", appRouter);

  logger.info(`✅ handlers registered`);

  listeningServer = server.listen(port, onListen(port));
};

const onListen = (port) => {
  logger.info(`🚀 Server listening on port ${port}`);
};

export const shutdown = (server) => async () => {
  logger.info("🛑 Received SIGTERM, shutting down...");
  await server.close();
  logger.info("🛑 Server closed");
  logger.info("🛑 Exiting...");
  return process.exit(0);
};

process.on("SIGTERM", shutdown(listeningServer));

start(server, handlersPath);
