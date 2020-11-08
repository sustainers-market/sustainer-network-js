const asyncHandler = require("express-async-handler");
const deps = require("./deps");

module.exports = ({
  permissionsLookupFn,
  terminatedSessionCheckFn,
  deletedSceneCheckFn,
  internalTokenFn,
  permissions,
  context,
}) =>
  asyncHandler(async (req, _, next) => {
    const externalTokenFn = () => {
      return { token: req.token, type: "Bearer" };
    };
    //TODO
    console.log({ context: req.context });
    await Promise.all([
      // If there are permissions with a lookup fn, check if the permissions are met.
      ...(permissions && permissionsLookupFn
        ? [
            deps.authorize({
              principal: req.context.principal,
              permissionsLookupFn,
              internalTokenFn,
              externalTokenFn,
              permissions,
              ...(req.context && context && { context: req.context[context] }),
            }),
          ]
        : []),
      // If there is a session, check if it's terminated.
      ...(req.context && req.context.session
        ? [
            terminatedSessionCheckFn({
              session: req.context.session,
              token: {
                internalFn: internalTokenFn,
                externalFn: externalTokenFn,
              },
            }),
          ]
        : []),
      // If there is a scene, check if it's deleted.
      ...(req.context && req.context.scene
        ? [
            deletedSceneCheckFn({
              scene: req.context.scene,
              token: {
                internalFn: internalTokenFn,
                externalFn: externalTokenFn,
              },
            }),
          ]
        : []),
    ]);

    next();
  });
