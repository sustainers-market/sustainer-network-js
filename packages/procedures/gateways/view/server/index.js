const deps = require("./deps");

module.exports = async ({
  stores,
  domain = process.env.DOMAIN,
  service = process.env.SERVICE,
  whitelist,
  permissionsLookupFn,
  terminatedSessionCheckFn,
  verifyFn
}) => {
  let server = deps.server({
    prehook: app =>
      deps.corsMiddleware({
        app,
        whitelist,
        credentials: true,
        methods: ["GET"]
      })
  });

  for (const {
    name,
    key = "session",
    priviledges,
    protected = true
  } of stores) {
    server = server.get(deps.get({ name, domain }), {
      path: `/${name}`,
      ...(protected && {
        preMiddleware: [
          deps.authentication({
            verifyFn: verifyFn({ key })
          }),
          deps.authorization({
            permissionsLookupFn,
            terminatedSessionCheckFn,
            permissions:
              priviledges instanceof Array
                ? priviledges.map(priviledge => {
                    return { service, domain, priviledge };
                  })
                : priviledges
          })
        ]
      })
    });
  }

  server.listen();
};
