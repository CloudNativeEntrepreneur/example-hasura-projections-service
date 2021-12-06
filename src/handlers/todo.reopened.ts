import axios from "axios";
import { config } from "../config.js";

const HASURA_OPERATION_COMPLETE_TODO = `
mutation CompleteTodo(
    $id: uuid!,
    $completed: Boolean!,
    $completedAt: timestamp, 
  ) {
  update_todos_by_pk(pk_columns: {id: $id}, _set: {completed: $completed, completedAt: $completedAt}) {
    todo
    id
    createdAt
    completedAt
    completed
    address
  }
}
`;

// execute the parent operation in Hasura
const completeTodo = async (completedTodo) => {
  const variables = {
    id: completedTodo.id,
    completed: completedTodo.completed,
    completedAt: completedTodo.completedAt,
  };

  const { data } = await axios.post(
    `${config.hasura.url}/v1/graphql`,
    {
      query: HASURA_OPERATION_COMPLETE_TODO,
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
    const hasuraResult = await completeTodo(data);

    if (hasuraResult.errors) {
      request.log.info({ msg: "🚨 hasura error", hasuraResult });
      response.status(400).json(hasuraResult);
    } else {
      request.log.info({ msg: "✅ hasura result", hasuraResult });
      response.status(201).json(hasuraResult);
    }
  }
};
