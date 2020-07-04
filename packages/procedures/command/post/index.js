const deps = require("./deps");

module.exports = ({
  mainFn,
  validateFn,
  normalizeFn,
  fillFn,
  aggregateFn,
  commandFn,
  queryAggregatesFn,
  readFactFn,
  streamFactFn,
  addFn,
}) => {
  return async (req, res) => {
    if (validateFn) {
      await validateFn(req.body.payload, {
        ...(req.body.context && { context: req.body.context }),
      });
    }
    if (fillFn) req.body.payload = await fillFn(req.body.payload);
    if (normalizeFn) req.body.payload = await normalizeFn(req.body.payload);

    const commandId = deps.uuid();

    const {
      events = [],
      response,
      headers = {},
      statusCode,
      thenFn,
    } = await mainFn({
      payload: req.body.payload,
      ...(req.body.root && { root: req.body.root }),
      ...(req.body.options && { options: req.body.options }),
      ...(req.body.claims && { claims: req.body.claims }),
      ...(req.body.context && { context: req.body.context }),
      aggregateFn: aggregateFn({
        ...(req.body.context && { context: req.body.context }),
        ...(req.body.claims && { claims: req.body.claims }),
        ...(req.body.token && { token: req.body.token }),
      }),
      queryAggregatesFn: queryAggregatesFn({
        ...(req.body.context && { context: req.body.context }),
        ...(req.body.claims && { claims: req.body.claims }),
        ...(req.body.token && { token: req.body.token }),
      }),
      readFactFn: readFactFn({
        ...(req.body.context && { context: req.body.context }),
        ...(req.body.claims && { claims: req.body.claims }),
        ...(req.body.token && { token: req.body.token }),
      }),
      streamFactFn: streamFactFn({
        ...(req.body.context && { context: req.body.context }),
        ...(req.body.claims && { claims: req.body.claims }),
        ...(req.body.token && { token: req.body.token }),
      }),
      commandFn: commandFn({
        ...(req.body.claims && { claims: req.body.claims }),
        ...(req.body.context && { context: req.body.context }),
        ...(req.body.token && { token: req.body.token }),
        ...(req.body.headers.idempotency && {
          idempotency: req.body.headers.idempotency,
        }),
        ...(req.body.headers.trace && { trace: req.body.headers.trace }),
        path: [
          ...(req.body.headers.path || []),
          {
            id: commandId,
            timestamp: deps.dateString(),
            issued: req.body.headers.issued,
            procedure: process.env.PROCEDURE,
            hash: process.env.OPERATION_HASH,
            name: process.env.NAME,
            domain: process.env.DOMAIN,
            service: process.env.SERVICE,
            network: process.env.NETWORK,
            host: process.env.HOST,
          },
        ],
      }),
    });

    const eventsPerStore = {};

    for (const {
      root,
      payload = {},
      correctNumber,
      version = 0,
      action,
      context,
      domain = process.env.DOMAIN,
      service = process.env.SERVICE,
    } of events) {
      const eventData = deps.createEvent({
        ...(root && { root }),
        payload,
        ...(req.body.headers.trace && { trace: req.body.headers.trace }),
        version,
        action,
        domain,
        service,
        ...(req.body.headers.idempotency && {
          idempotency: req.body.headers.idempotency,
        }),
        ...(context && { context }),
        path: [
          ...(req.body.headers.path || []),
          {
            procedure: process.env.PROCEDURE,
            id: commandId,
            timestamp: deps.dateString(),
            issued: req.body.headers.issued,
            name: process.env.NAME,
            domain: process.env.DOMAIN,
            service: process.env.SERVICE,
            network: process.env.NETWORK,
            host: process.env.HOST,
            hash: process.env.OPERATION_HASH,
          },
        ],
      });
      const normalizedEvent = {
        data: eventData,
        ...(correctNumber && { number: correctNumber }),
      };

      eventsPerStore[service] = eventsPerStore[service] || {};

      eventsPerStore[service][domain] = eventsPerStore[service][domain]
        ? eventsPerStore[service][domain].concat([normalizedEvent])
        : [normalizedEvent];
    }

    const fns = [];
    for (const service in eventsPerStore) {
      for (const domain in eventsPerStore[service]) {
        fns.push(
          addFn({
            domain,
            service,
            ...(req.body.context && { context: req.body.context }),
            ...(req.body.claims && { claims: req.body.claims }),
            events: eventsPerStore[service][domain],
          })
        );
      }
    }

    await Promise.all(fns);

    if (thenFn) await thenFn();

    if (response || events.length) {
      res
        .set(headers)
        .status(statusCode || (events.length ? 202 : 200))
        .send({
          ...response,
          ...(events.length && { _id: commandId }),
        });
    } else {
      res.set(headers).sendStatus(204);
    }
  };
};
