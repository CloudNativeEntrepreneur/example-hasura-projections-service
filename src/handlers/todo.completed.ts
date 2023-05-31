import axios from "axios";
import { config } from "../config.js";
import { hasuraAndKnative } from "../lib/handlers.js";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3 });

const HASURA_OPERATION_COMPLETE_TODO = `
mutation CompleteTodo(
    $id: uuid!,
    $completed: Boolean!,
    $completedAt: timestamp!, 
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
const completeTodo = async (todo) => {
  const variables = {
    id: todo.id,
    completed: todo.completed,
    completedAt: new Date(todo.timestamp),
  };

  const result = await axios.post(
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

  const { data, status } = result;

  return {
    status,
    data: (data as any).data,
    errors: (data as any).errors,
  };
};

export const handle = hasuraAndKnative(completeTodo);
