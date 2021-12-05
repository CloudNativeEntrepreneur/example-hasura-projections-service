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
const insertTodo = async (createdTodo) => {
  const variables = {
    address: createdTodo.address,
    createdAt: createdTodo.createdAt,
    completed: createdTodo.completed,
    completedAt: createdTodo.completedAt,
    id: createdTodo.id,
    todo: createdTodo.todo,
  };

  console.log("variables", variables);

  const { data } = await axios.post(
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

  return {
    data: (data as any).data,
    errors: (data as any).errors,
  };
};

export const handle = async (request, response, event) => {
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
    response.status(200).json({ id });
  } else {
    request.log.info({ msg: `⏳ denormalizing ${type}`, data, event });
    const hasuraResult = await insertTodo(data);

    if (hasuraResult.errors) {
      request.log.info({ msg: "🚨 hasura error", hasuraResult });
      response.status(400).json(hasuraResult);
    } else {
      request.log.info({ msg: "✅ hasura result", hasuraResult });
      response.status(201).json(hasuraResult);
    }
  }
};
