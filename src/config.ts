export const config = {
  denormalizer: "example-hasura",

  port: parseInt(process.env.PORT || "", 10) || 5010,

  handlerBasePath: process.env.HANDLER_BASE_PATH || "src",

  hasura: {
    url:
      process.env.HASURA_URL || "http://example-hasura.default.127.0.0.1.sslip.io",
    adminSecret:
      process.env.HASURA_ADMIN_SECRET || "af18a72fc1eb42a78aa8c6d679b4842a",
  },
};
