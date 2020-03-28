const logger = require("@blossm/logger");

const deps = require("./deps");

const common = ({ method, dataParam, operation, root, data }) => {
  return {
    in: ({ context, host = process.env.HOST }) => {
      return {
        with: async ({ path, tokenFn, claims } = {}) => {
          const internal = host == process.env.HOST;

          const token = internal
            ? await deps.operationToken({
                tokenFn,
                operation
              })
            : await deps.networkToken({ tokenFn, host });

          const url = internal
            ? deps.operationUrl({
                operation,
                host,
                ...(path && { path }),
                ...(root && { root })
              })
            : deps.networkUrl({
                host,
                ...(path && { path }),
                ...(root && { root })
              });

          const response = await method(url, {
            [dataParam]: {
              ...(data && { ...data }),
              ...(context && { context }),
              ...(claims && { claims })
            },
            ...(token && {
              headers: {
                Authorization: `Bearer ${token}`
              }
            })
          });

          if (response.statusCode >= 300) {
            logger.info("response errored: ", {
              response,
              url,
              data,
              context,
              token
            });
            throw deps.constructError({
              statusCode: response.statusCode,
              message: response.body
                ? JSON.parse(response.body).message || "Not specified"
                : null
            });
          }
          if (response.statusCode == 204) return null;

          return JSON.parse(response.body);
        }
      };
    }
  };
};

module.exports = (...operation) => {
  return {
    post: data =>
      common({ method: deps.post, dataParam: "body", operation, data }),
    put: (root, data) =>
      common({ method: deps.put, dataParam: "body", operation, root, data }),
    delete: root =>
      common({ method: deps.delete, dataParam: "body", operation, root }),
    get: query => {
      const root = query.root;
      delete query.root;
      return common({
        method: deps.get,
        dataParam: "query",
        operation,
        root,
        data: query
      });
    }
  };
};
