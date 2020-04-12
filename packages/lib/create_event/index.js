const { string: dateString } = require("@blossm/datetime");
const deps = require("./deps");

module.exports = ({
  root,
  payload,
  version = 0,
  trace,
  action,
  domain,
  service,
  context,
  idempotency,
  path
} = {}) => {
  return {
    headers: {
      root: root || deps.uuid(),
      action,
      domain,
      service,
      topic: `did-${action}.${domain}.${service}`,
      version,
      created: dateString(),
      idempotency: idempotency || deps.uuid(),
      ...(context && { context }),
      ...(trace && { trace }),
      ...(path && {
        path: path.map(p => {
          return {
            ...(p.name && { name: p.name }),
            ...(p.domain && { domain: p.domain }),
            ...(p.service && { service: p.service }),
            ...(p.issued && { issued: p.issued }),
            network: p.network,
            hash: p.hash,
            procedure: p.procedure,
            host: p.host
          };
        })
      })
    },
    payload
  };
};
