import axios from "axios";
import { config } from "../config.js";

const HASURA_OPERATION_INSERT_TODO = `
mutation InsertTodo(
    $address: String, 
    $createdAt: timestamp, 
    $completed: Boolean
    $id: uuid, 
    $todo: String, 
  ) {
  insert_todos_one(object: {
    address: $address, 
    createdAt: $createdAt, 
    completed: $completed
    id: $id, 
    todo: $todo, 
  }) {
    address
    createdAt
    completed
    completedAt
    id
    todo
  }
}
`;

// execute the parent operation in Hasura
const insertTodo = async (todo) => {
  const variables = {
    address: todo.address,
    createdAt: new Date(todo.timestamp),
    completed: todo.completed,
    id: todo.id,
    todo: todo.todo,
  };

  const result = await axios.post(
    `${config.hasura.url}/v1/graphql`,
    {
      query: HASURA_OPERATION_INSERT_TODO,
      variables,
    },
    {
      headers: {
        "x-hasura-admin-secret": config.hasura.adminSecret,
      },
    }
  );

  const { data, status } = result;

  return {
    status,
    data: (data as any).data,
    errors: (data as any).errors,
  };
};

export const handle = async (
  request,
  response,
  event,
  handlerOptions = { sync: false }
) => {
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
    const hasuraResult = await insertTodo(data);

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
