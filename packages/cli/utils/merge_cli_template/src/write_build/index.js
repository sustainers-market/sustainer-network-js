const fs = require("fs-extra");
const yaml = require("yaml");
const path = require("path");

const viewStore = require("./view_store");
const commandGateway = require("./command_gateway");
const viewGateway = require("./view_gateway");
const factGateway = require("./fact_gateway");
const command = require("./command");
const projection = require("./projection");
const eventStore = require("./event_store");
const job = require("./job");
const fact = require("./fact");
const viewComposite = require("./view_composite");

const steps = ({
  region,
  domain,
  name,
  actions,
  events,
  publicKeyUrl,
  project,
  network,
  timeout,
  mongodbUser,
  mongodbHost,
  mongodbProtocol,
  memory,
  envUriSpecifier,
  containerRegistery,
  mainContainerName,
  coreNetwork,
  dnsZone,
  service,
  procedure,
  host,
  env,
  context,
  operationHash,
  operationName,
  envVars,
  devEnvVars,
  rolesBucket,
  secretBucket,
  secretBucketKeyLocation,
  secretBucketKeyRing,
  blockSchedule,
  imageExtension,
  runUnitTests,
  runBaseUnitTests,
  runIntegrationTests,
  runBaseIntegrationTests,
  computeUrlId,
  strict,
  dependencyKeyEnvironmentVariables,
}) => {
  const serviceName = `${region}-${operationName}-${operationHash}`;
  const uri = `${operationHash}.${region}.${envUriSpecifier}${network}`;
  switch (procedure) {
    case "view-store":
      return viewStore({
        imageExtension,
        region,
        name,
        project,
        network,
        context,
        memory,
        host,
        computeUrlId,
        envUriSpecifier,
        dependencyKeyEnvironmentVariables,
        containerRegistery,
        mainContainerName,
        dnsZone,
        timeout,
        procedure,
        operationHash,
        operationName,
        serviceName,
        coreNetwork,
        env,
        uri,
        rolesBucket,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        mongodbUser,
        mongodbHost,
        mongodbProtocol,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict,
      });
    case "view-composite":
      return viewComposite({
        imageExtension,
        region,
        domain,
        service,
        name,
        project,
        network,
        context,
        host,
        memory,
        computeUrlId,
        envUriSpecifier,
        dependencyKeyEnvironmentVariables,
        containerRegistery,
        mainContainerName,
        dnsZone,
        procedure,
        operationHash,
        operationName,
        serviceName,
        coreNetwork,
        timeout,
        env,
        uri,
        rolesBucket,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict,
      });
    case "event-store":
      return eventStore({
        imageExtension,
        domain,
        actions,
        region,
        project,
        dnsZone,
        service,
        procedure,
        network,
        host,
        computeUrlId,
        envUriSpecifier,
        coreNetwork,
        memory,
        env,
        serviceName,
        dependencyKeyEnvironmentVariables,
        containerRegistery,
        mainContainerName,
        operationHash,
        timeout,
        blockSchedule,
        uri,
        rolesBucket,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        mongodbUser,
        mongodbHost,
        mongodbProtocol,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict,
      });
    case "projection":
      return projection({
        imageExtension,
        region,
        name,
        events,
        project,
        network,
        host,
        dependencyKeyEnvironmentVariables,
        envUriSpecifier,
        computeUrlId,
        containerRegistery,
        mainContainerName,
        coreNetwork,
        timeout,
        dnsZone,
        context,
        memory,
        procedure,
        operationName,
        operationHash,
        env,
        serviceName,
        envVars,
        devEnvVars,
        uri,
        rolesBucket,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict,
      });
    case "command":
      return command({
        imageExtension,
        name,
        region,
        domain,
        project,
        host,
        network,
        memory,
        computeUrlId,
        coreNetwork,
        dependencyKeyEnvironmentVariables,
        mainContainerName,
        envUriSpecifier,
        containerRegistery,
        operationHash,
        dnsZone,
        service,
        procedure,
        timeout,
        env,
        serviceName,
        uri,
        envVars,
        devEnvVars,
        rolesBucket,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict,
      });
    case "job":
      return job({
        imageExtension,
        name,
        domain,
        region,
        project,
        network,
        host,
        envUriSpecifier,
        containerRegistery,
        mainContainerName,
        dependencyKeyEnvironmentVariables,
        coreNetwork,
        dnsZone,
        service,
        procedure,
        timeout,
        memory,
        computeUrlId,
        operationHash,
        env,
        serviceName,
        uri,
        rolesBucket,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        envVars,
        devEnvVars,
        strict,
      });
    case "fact":
      return fact({
        imageExtension,
        name,
        domain,
        region,
        project,
        network,
        host,
        envUriSpecifier,
        containerRegistery,
        mainContainerName,
        dependencyKeyEnvironmentVariables,
        coreNetwork,
        dnsZone,
        service,
        procedure,
        timeout,
        memory,
        computeUrlId,
        operationHash,
        env,
        serviceName,
        uri,
        rolesBucket,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        envVars,
        devEnvVars,
        strict,
      });
    case "command-gateway":
      return commandGateway({
        imageExtension,
        publicKeyUrl,
        region,
        project,
        envUriSpecifier,
        containerRegistery,
        mainContainerName,
        dependencyKeyEnvironmentVariables,
        dnsZone,
        memory,
        coreNetwork,
        env,
        host,
        envVars,
        timeout,
        devEnvVars,
        computeUrlId,
        service,
        domain,
        procedure,
        network,
        operationHash,
        operationName,
        serviceName,
        rolesBucket,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict,
      });
    case "view-gateway":
      return viewGateway({
        imageExtension,
        publicKeyUrl,
        region,
        project,
        context,
        host,
        envUriSpecifier,
        containerRegistery,
        mainContainerName,
        dependencyKeyEnvironmentVariables,
        computeUrlId,
        dnsZone,
        coreNetwork,
        memory,
        timeout,
        env,
        procedure,
        network,
        operationHash,
        operationName,
        serviceName,
        rolesBucket,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict,
      });
    case "fact-gateway":
      return factGateway({
        imageExtension,
        publicKeyUrl,
        region,
        project,
        envUriSpecifier,
        containerRegistery,
        mainContainerName,
        coreNetwork,
        computeUrlId,
        dependencyKeyEnvironmentVariables,
        dnsZone,
        timeout,
        host,
        memory,
        env,
        service,
        domain,
        procedure,
        network,
        operationHash,
        operationName,
        serviceName,
        rolesBucket,
        secretBucket,
        secretBucketKeyLocation,
        secretBucketKeyRing,
        runUnitTests,
        runBaseUnitTests,
        runIntegrationTests,
        runBaseIntegrationTests,
        strict,
      });
  }
};

const imageExtension = ({ service, context, domain, name, procedure }) => {
  switch (procedure) {
    case "view-store":
    case "view-composite":
      return `${context}.${name}`;
    case "event-store":
    case "command-gateway":
      return `${service}.${domain}`;
    case "view-gateway":
      return context;
    case "fact-gateway":
      if (service) {
        if (domain) return `${service}.${domain}`;
        return service;
      }
      return "";
    case "projection":
      return `${context}.${name}`;
    case "command":
      return `${service}.${domain}.${name}`;
    case "job":
    case "fact":
      return `${service ? `${service}.` : ""}${
        domain ? `${domain}.` : ""
      }${name}`;
    default:
      return "";
  }
};

module.exports = ({
  workingDir,
  region,
  domain,
  actions,
  events,
  publicKeyUrl,
  name,
  project,
  network,
  procedure,
  memory,
  host,
  context,
  envUriSpecifier,
  coreNetwork,
  containerRegistery,
  mainContainerName,
  dependencyKeyEnvironmentVariables,
  blockSchedule,
  mongodbUser,
  mongodbHost,
  mongodbProtocol,
  dnsZone,
  service,
  operationHash,
  operationName,
  envVars,
  devEnvVars,
  timeout,
  env,
  rolesBucket,
  secretBucket,
  secretBucketKeyLocation,
  secretBucketKeyRing,
  computeUrlId,
  strict,
}) => {
  const buildPath = path.resolve(workingDir, "build.yaml");

  const i = imageExtension({
    procedure,
    name,
    domain,
    service,
    context,
  });

  const runUnitTests = fs.existsSync(path.resolve(workingDir, "test/unit"));
  const runBaseUnitTests = fs.existsSync(
    path.resolve(workingDir, "base_test/unit")
  );
  const runIntegrationTests = fs.existsSync(
    path.resolve(workingDir, "test/integration")
  );
  const runBaseIntegrationTests = fs.existsSync(
    path.resolve(workingDir, "base_test/integration")
  );

  const build = {
    steps: steps({
      imageExtension: i,
      region,
      domain,
      name,
      actions,
      events,
      publicKeyUrl,
      project,
      network,
      context,
      memory,
      procedure,
      envVars,
      devEnvVars,
      envUriSpecifier,
      dependencyKeyEnvironmentVariables,
      containerRegistery,
      mainContainerName,
      dnsZone,
      service,
      timeout,
      env,
      host,
      blockSchedule,
      coreNetwork,
      computeUrlId,
      operationHash,
      operationName,
      mongodbHost,
      mongodbUser,
      mongodbProtocol,
      rolesBucket,
      secretBucket,
      secretBucketKeyLocation,
      secretBucketKeyRing,
      runUnitTests,
      runBaseUnitTests,
      runIntegrationTests,
      runBaseIntegrationTests,
      strict,
    }),
  };

  fs.writeFileSync(buildPath, yaml.stringify(build));
};
