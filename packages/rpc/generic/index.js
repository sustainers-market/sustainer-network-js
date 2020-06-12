const logger = require("@blossm/logger");

const deps = require("./deps");

const formatResponse = (data) => {
  try {
    const formattedResponse = JSON.parse(data);
    return formattedResponse;
  } catch (e) {
    return data;
  }
};

const jsonString = (string) => {
  try {
    return JSON.parse(string);
  } catch (e) {
    return null;
  }
};

const common = ({ method, dataParam, operation, id, data }) => {
  return {
    in: ({ context, network, host = process.env.HOST }) => {
      return {
        with: async ({
          path,
          internalTokenFn,
          externalTokenFn,
          currentToken,
          key,
          claims,
          enqueueFn,
        } = {}) => {
          const internal = host == process.env.HOST;

          const { token, type } =
            (internal
              ? await deps.operationToken({
                  tokenFn: internalTokenFn,
                  operation,
                })
              : await deps.networkToken({
                  tokenFn: externalTokenFn,
                  network,
                  key,
                })) || {};

          const url = internal
            ? deps.operationUrl({
                operation,
                host,
                ...(path && { path }),
                ...(id && { id }),
              })
            : deps.networkUrl({
                host,
                ...(path && { path }),
                ...(id && { id }),
              });

          const requestData = {
            ...(data && { ...data }),
            ...(internal && {
              ...(context && { context }),
              ...(claims && { claims }),
              ...(currentToken && { token: currentToken }),
            }),
          };

          const response =
            enqueueFn && method == deps.post
              ? await enqueueFn({ url, data: requestData, token })
              : await method(url, {
                  [dataParam]: requestData,
                  ...(token && {
                    headers: {
                      authorization: `${type} ${token}`,
                    },
                  }),
                });

          //Stream doesn't have a reponse.
          if (!response) return;

          if (response.statusCode >= 300) {
            logger.info("response errored: ", {
              response,
              url,
              data,
              context,
              network,
              token,
            });
            const parsedBody = response.body ? jsonString(response.body) : null;
            throw deps.constructError({
              statusCode: response.statusCode,
              message: parsedBody.message || "Not specified",
              ...(parsedBody.info && { info: parsedBody.info }),
              ...(parsedBody.code && { code: parsedBody.code }),
            });
          }

          return {
            ...(response.body && { body: formatResponse(response.body) }),
            ...(response.headers && {
              headers: formatResponse(response.headers),
            }),
            statusCode: response.statusCode,
          };
        },
      };
    },
  };
};

module.exports = (...operation) => {
  return {
    post: (data) =>
      common({
        method: deps.post,
        dataParam: "body",
        operation,
        data,
      }),
    put: (id, data) =>
      common({ method: deps.put, dataParam: "body", operation, id, data }),
    delete: (id) =>
      common({ method: deps.delete, dataParam: "body", operation, id }),
    get: (query) => {
      const id = query.id;
      delete query.id;
      return common({
        method: deps.get,
        dataParam: "query",
        operation,
        id,
        data: query,
      });
    },
    stream: (fn, query) => {
      const id = query.id;
      delete query.id;
      let progress = "";
      return common({
        method: (url, data) =>
          deps.stream(
            url,
            (data) => {
              const string = data.toString();
              let parsedData = jsonString(progress + string);
              if (!parsedData) {
                progress = progress + string;
                return;
              }
              progress = "";
              fn(parsedData);
            },
            data
          ),
        dataParam: "query",
        operation,
        id,
        data: query,
      });
    },
  };
};
