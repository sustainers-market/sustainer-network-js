const yarnInstall = require("./steps/yarn_install");
const unitTests = require("./steps/unit_tests");
const baseUnitTests = require("./steps/base_unit_tests");
const buildImage = require("./steps/build_image");
const dockerComposeUp = require("./steps/docker_compose_up");
const dockerComposeProcesses = require("./steps/docker_compose_processes");
const integrationTests = require("./steps/integration_tests");
const baseIntegrationTests = require("./steps/base_integration_tests");
const dockerComposeLogs = require("./steps/docker_compose_logs");
const dockerPush = require("./steps/docker_push");
const writeEnv = require("./steps/write_env");
const deploy = require("./steps/deploy");
const startDnsTransaction = require("./steps/start_dns_transaction");
const addDnsTransaction = require("./steps/add_dns_transaction");
const executeDnsTransaction = require("./steps/execute_dns_transaction");
const abortDnsTransaction = require("./steps/abort_dns_transaction");
const mapDomain = require("./steps/map_domain");

module.exports = ({
  name,
  region,
  domain,
  project,
  network,
  mainContainerName,
  envUriSpecifier,
  containerRegistery,
  uri,
  dnsZone,
  service,
  memory,
  env,
  operationHash,
  serviceName,
  computeUrlId,
  procedure,
  rolesBucket,
  secretBucket,
  secretBucketKeyLocation,
  secretBucketKeyRing,
  twilioTestReceivingPhoneNumber,
  twilioSendingPhoneNumber,
  imageExtension,
  runUnitTests,
  runBaseUnitTests,
  runIntegrationTests,
  runBaseIntegrationTests,
  strict
}) => {
  return [
    yarnInstall,
    ...(runUnitTests ? [unitTests] : []),
    ...(runBaseUnitTests ? [baseUnitTests] : []),
    buildImage({
      extension: imageExtension,
      containerRegistery,
      service,
      procedure
    }),
    writeEnv({
      mainContainerName,
      project,
      domain,
      region,
      procedure,
      service,
      secretBucket,
      secretBucketKeyRing,
      secretBucketKeyLocation,
      custom: {
        NAME: name,
        TWILIO_TEST_RECEIVING_PHONE_NUMBER: twilioTestReceivingPhoneNumber,
        TWILIO_SENDING_PHONE_NUMBER: twilioSendingPhoneNumber
      }
    }),
    dockerComposeUp,
    dockerComposeProcesses,
    ...(runBaseIntegrationTests ? [baseIntegrationTests({ strict })] : []),
    ...(runIntegrationTests ? [integrationTests({ strict })] : []),
    ...(strict
      ? [
          dockerPush({
            extension: imageExtension,
            containerRegistery,
            service,
            procedure
          }),
          deploy({
            serviceName,
            procedure,
            service,
            extension: imageExtension,
            rolesBucket,
            secretBucket,
            secretBucketKeyLocation,
            secretBucketKeyRing,
            containerRegistery,
            computeUrlId,
            domain,
            operationHash,
            region,
            memory,
            project,
            network,
            envUriSpecifier,
            nodeEnv: env,
            env: `NAME=${name},TWILIO_SENDING_PHONE_NUMBER=${twilioSendingPhoneNumber}`,
            labels: `name=${name}`
          }),
          startDnsTransaction({ dnsZone, project }),
          addDnsTransaction({ uri, dnsZone, project }),
          executeDnsTransaction({ dnsZone, project }),
          abortDnsTransaction({ dnsZone, project }),
          mapDomain({
            uri,
            project,
            region,
            serviceName
          })
        ]
      : [dockerComposeLogs])
  ];
};
