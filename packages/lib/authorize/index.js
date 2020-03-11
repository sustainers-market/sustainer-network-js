const deps = require("./deps");

module.exports = async ({
  claims: { sub },
  context,
  permissionsLookupFn,
  permissions = []
}) => {
  if (permissions == "none")
    return {
      permissions: [],
      ...(sub && { principle: sub })
    };

  const principlePermissions = await permissionsLookupFn({
    principle: sub,
    context
  });

  const satisfiedPermissions = principlePermissions.filter(
    principlePermission => {
      const [
        principlePermissionService,
        principlePermissionDomain,
        principlePermissionPriviledge
      ] = principlePermission.split(":");

      for (const permission of permissions) {
        const [
          permissionService,
          permissionDomain,
          permissionPriviledge
        ] = permission.split(":");

        if (
          principlePermissionService == permissionService &&
          principlePermissionDomain == permissionDomain &&
          principlePermissionPriviledge == permissionPriviledge
        )
          return true;
      }
      return false;
    }
  );

  if (satisfiedPermissions.length == 0)
    throw deps.invalidCredentialsError.tokenInvalid();

  return {
    permissions: satisfiedPermissions,
    principle: sub
  };
};
