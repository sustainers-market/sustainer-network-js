const { oneLine } = require("common-tags");

module.exports = ({
  name,
  service,
  domain,
  operationHash,
  eventAction,
  eventDomain,
  eventService,
  context,
  // envUriSpecifier,
  // network,
  project,
  // region,
  envNameSpecifier
}) => {
  return {
    name: "gcr.io/cloud-builders/gcloud",
    entrypoint: "bash",
    args: [
      "-c",
      oneLine`
    gcloud beta pubsub subscriptions create ${service}-${context}-${operationHash}
    --topic=did-${eventAction}.${eventDomain}.${eventService}
    --push-endpoint=https://us-central1-core-projection-overview--3823312914-p3u6hkyfwa-uc.a.run.app
    --push-auth-service-account=cloud-run-pubsub-invoker@${project}${envNameSpecifier}.iam.gserviceaccount.com
    --topic-project=${project}${envNameSpecifier}
    --expiration-period=never
    --ack-deadline=30
    --project=${project}${envNameSpecifier}
    --labels=service=${service},context=${context},domain=${domain},name=${name},event-action=${eventAction},event-domain=${eventDomain},event-service=${eventService},hash=${operationHash} || exit 0
    `
    ]
  };
};

//    https://${operationHash}.${region}.${envUriSpecifier}${network}
