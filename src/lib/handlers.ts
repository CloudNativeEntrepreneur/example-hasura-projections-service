import { config } from "../config.js";

export const hasuraAndKnative =
  (hasuraGraphQLExecutorFn) =>
  async (request, response, event, handlerOptions = { sync: false }) => {
    const { sync } = handlerOptions;
    const { data, type } = event;
    const { completedDenormalizers, id } = data;
    const hasBeenProcessed =
      completedDenormalizers &&
      completedDenormalizers.includes(config.denormalizer);

    request.log.info({ msg: `⏳ handling ${type}`, data, hasBeenProcessed });

    if (hasBeenProcessed) {
      request.log.info({
        msg: "🛑 this message has already been processed via the sync handler",
        id,
      });

      if (sync) {
        return response.status(202).json({ id });
      } else {
        return response.status(202).send();
      }
    } else {
      request.log.info({ msg: `⏳ denormalizing ${type}`, data, event });
      const hasuraResult = await hasuraGraphQLExecutorFn(data);

      if (hasuraResult.errors) {
        request.log.info({ msg: "🚨 hasura error", hasuraResult });
        return response.status(400).json(hasuraResult);
      } else {
        request.log.info({ msg: "✅ hasura result", hasuraResult });
        if (sync) {
          return response.status(hasuraResult.status).json(hasuraResult);
        } else {
          return response.status(202).send();
        }
      }
    }
  };
