import axios from "axios";
import { config } from "../config.js";
import { hasuraAndKnative } from "../lib/handlers.js";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3 });

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
    completed: $completed,
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

export const handle = hasuraAndKnative(insertTodo);
