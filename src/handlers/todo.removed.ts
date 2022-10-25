import axios from "axios";
import { config } from "../config.js";
import { hasuraAndKnative } from "../lib/handlers.js";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3 });

const HASURA_OPERATION_COMPLETE_TODO = `
mutation RemoveTodo(
    $id: uuid!
  ) {
  delete_todos_by_pk(id: $id) {
    id
  }
}
`;

// execute the parent operation in Hasura
const removeTodo = async (removedTodo) => {
  const variables = {
    id: removedTodo.id,
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

export const handle = hasuraAndKnative(removeTodo);
