const deployCliTemplate = require("@blossm/deploy-cli-template");
const hash = require("@blossm/operation-hash");
const trim = require("@blossm/trim-string");
const { MAX_LENGTH } = require("@blossm/service-name-consts");

module.exports = deployCliTemplate({
  domain: "view-gateway",
  dir: __dirname,
  configFn: (config) => {
    return {
      operationName: trim(
        `${config.procedure}-${config.context}${
          config.service ? `-${config.service}` : ""
        }${config.domain ? `-${config.domain}` : ""}`,
        MAX_LENGTH
      ),
      operationHash: hash(
        ...(config.domain ? [config.domain] : []),
        ...(config.service ? [config.service] : []),
        config.context,
        config.procedure
      ),
    };
  },
});
