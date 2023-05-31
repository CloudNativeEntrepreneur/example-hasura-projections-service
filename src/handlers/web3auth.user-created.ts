import axios from "axios";
import { config } from "../config.js";
import { hasuraAndKnative } from "../lib/handlers.js";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3 });

const HASURA_OPERATION_INSERT_WEB3AUTH_USER = `
mutation InsertWeb3AuthUser(
    $address: String, 
    $username: String,
  ) {
  insert_web3auth_users_one(object: {
    address: $address, 
    username: $username, 
  }) {
    address
    username
  }
}
`;

// execute the parent operation in Hasura
const insertWeb3AuthUser = async (web3authUser) => {
  const variables = {
    address: web3authUser.address,
    username: web3authUser.username,
  };

  const result = await axios.post(
    `${config.hasura.url}/v1/graphql`,
    {
      query: HASURA_OPERATION_INSERT_WEB3AUTH_USER,
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

export const handle = hasuraAndKnative(insertWeb3AuthUser);
