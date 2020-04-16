const eventStore = require("@blossm/event-store-rpc");
const command = require("@blossm/command-rpc");
const uuid = require("@blossm/uuid");
const createEvent = require("@blossm/create-event");
const { hash } = require("@blossm/crypt");

module.exports = async ({
  permissions = [],
  context = {},
  phone = "+19195551144",
  id,
} = {}) => {
  const identityRoot = uuid();
  const roleRoot = uuid();
  const roleId = uuid();
  const principleRoot = uuid();
  const sessionRoot = uuid();

  // Create the identity for the token.
  await eventStore({
    domain: "identity",
    service: "core",
  }).add([
    {
      data: createEvent({
        root: identityRoot,
        payload: {
          principle: {
            root: principleRoot,
            service: process.env.SERVICE,
            network: process.env.NETWORK,
          },
          phone: await hash(phone),
          id,
        },
        action: "register",
        domain: "identity",
        service: "core",
      }),
    },
  ]);

  // Add permissions to the role
  // and add role to the principle.
  await Promise.all([
    eventStore({
      domain: "role",
      service: "core",
    }).add([
      {
        data: createEvent({
          root: roleRoot,
          payload: {
            id: roleId,
            permissions,
          },
          action: "create",
          domain: "role",
          service: "core",
        }),
      },
    ]),
    eventStore({
      domain: "principle",
      service: "core",
    }).add([
      {
        data: createEvent({
          root: principleRoot,
          payload: {
            roles: [
              {
                id: roleId,
                service: process.env.SERVICE,
                network: process.env.NETWORK,
              },
            ],
          },
          action: "add-roles",
          domain: "principle",
          service: "core",
        }),
      },
    ]),
  ]);

  // Add a session.
  await eventStore({
    domain: "session",
    service: "core",
  }).add([
    {
      data: createEvent({
        root: sessionRoot,
        payload: {},
        action: "start",
        domain: "session",
        service: "core",
      }),
    },
  ]);

  const { tokens } = await command({
    name: "upgrade",
    domain: "session",
    service: "core",
  })
    .set({
      context: {
        network: process.env.NETWORK,
        ...context,
        session: {
          root: sessionRoot,
          service: process.env.SERVICE,
          network: process.env.NETWORK,
        },
      },
      claims: {
        iss: `session.${process.env.SERVICE}.${process.env.NETWORK}/upgrade`,
        aud: `${process.env.NETWORK}`,
        exp: "9999-12-31T00:00:00.000Z",
      },
    })
    .issue(
      {
        principle: {
          root: principleRoot,
          service: "core",
          network: process.env.NETWORK,
        },
      },
      { root: sessionRoot }
    );

  return { token: tokens[0].value };
};
