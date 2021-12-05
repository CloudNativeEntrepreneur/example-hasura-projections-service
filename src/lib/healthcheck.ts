export const healthcheck = (req, reply) => {
  reply.code(200).send("ok");
};
