import axios from "axios";
import { config } from "../config.js";
import { hasuraAndKnative } from "../lib/handlers.js";
import axiosRetry from "axios-retry";

axiosRetry(axios, { retries: 3 });

const HASURA_OPERATION_UPDATE_WEB3AUTH_USER = `
mutation UpdateWeb3AuthUser(
    $address: String!,
    $username: String!
  ) {
  update_web3auth_users_by_pk(pk_columns: {address: $address}, _set: {username: $username}) {
    address
    username
  }
}
`;

// execute the parent operation in Hasura
const updateWeb3AuthUser = async (webauth_user) => {
  const variables = {
    address: webauth_user.address,
    username: webauth_user.username,
  };

  const result = await axios.post(
    `${config.hasura.url}/v1/graphql`,
    {
      query: HASURA_OPERATION_UPDATE_WEB3AUTH_USER,
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

export const handle = hasuraAndKnative(updateWeb3AuthUser);
