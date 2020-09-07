require("localenv");
const { expect } = require("chai");
const viewStore = require("@blossm/view-store-rpc");
const eventStore = require("@blossm/event-store-rpc");
const createEvent = require("@blossm/create-event");

const request = require("@blossm/request");

const { testing, name, context } = require("../../config.json");
const { dateString } = require("@blossm/command-rpc/deps");

const url = `http://${process.env.MAIN_CONTAINER_NAME}`;

const principalRoot = "some-principal-root";
const principalService = "some-principal-service";
const principalNetwork = "some-principal-network";

//These must match whats in merge-cli-template
const groupRoot = "some-group-root";
const groupService = "some-group-service";
const groupNetwork = "some-group-network";

const checkResponse = ({ data, expected }) => {
  for (const property in expected) {
    try {
      expect(data[property]).to.exist;
    } catch (err) {
      //eslint-disable-next-line no-console
      console.log("Expectation doesn't exist.", {
        property,
        actual: data,
        expected,
      });
    }
    if (expected[property]) {
      if (
        typeof expected[property] == "object" &&
        !(expected[property] instanceof Array)
      ) {
        checkResponse({
          data: data[property],
          expected: expected[property],
        });
      } else if (expected[property] instanceof Array) {
        expect(data[property]).to.be.an("array");
        let i = 0;
        for (const expectedValue of expected[property]) {
          checkResponse({
            data: data[property][i],
            expected: expectedValue[i],
          });
          i++;
        }
      } else {
        expect(data[property]).to.deep.equal(expected[property]);
      }
    }
  }
};

//TODO add integration tests for /replay
describe("Projection integration tests", () => {
  it("should return successfully", async () => {
    let stepCount = 0;
    for (const step of testing.steps) {
      //eslint-disable-next-line no-console
      console.log(`Executing step ${stepCount++}`);

      if (step.pre) {
        for (const {
          action,
          domain,
          service,
          root,
          payload,
          groupsAdded,
        } of step.pre) {
          const stateEvent = createEvent({
            root,
            payload,
            action,
            domain,
            service,
            network: process.env.NETWORK,
            groupsAdded,
          });

          await eventStore({ domain, service }).add({
            eventData: [{ event: stateEvent }],
          });
        }
      }

      const now = dateString();
      const event = createEvent({
        root: step.root,
        action: step.event.action,
        payload: step.payload,
        domain: step.event.domain,
        service: step.event.service,
        network: process.env.NETWORK,
        context: {
          ...(context && {
            [context]: {
              root: "some-context-root",
              service: process.env.CONTEXT,
              network: process.env.NETWORK,
            },
          }),
        },
        groupsAdded: [
          {
            root: groupRoot,
            service: groupService,
            network: groupNetwork,
          },
        ],
      });

      await eventStore({
        domain: step.event.domain,
        service: step.event.service,
      }).add({ eventData: [{ event }] });

      const response = await request.post(url, {
        body: {
          message: {
            data: Buffer.from(
              JSON.stringify({
                root: step.root,
                action: step.event.action,
                domain: step.event.domain,
                service: step.event.service,
                timestamp: now,
              })
            ),
          },
        },
      });

      expect(response.statusCode).to.equal(204);

      const { body: v } = await viewStore({
        name,
        context,
      })
        .set({
          context: {
            ...(context && {
              [context]: {
                root:
                  (step.context && step.context.root) || "some-context-root",
                service:
                  (step.context && step.context.service) || process.env.CONTEXT,
                network:
                  (step.context && step.context.network) || process.env.NETWORK,
              },
            }),
            principal: {
              root: principalRoot,
              service: principalService,
              network: principalNetwork,
            },
          },
        })
        .read(step.result.query || {});

      if (step.result.value) {
        checkResponse({
          expected: step.result.value,
          data: v.content,
        });
      } else if (step.result.values) {
        expect(step.result.values.length).to.equal(v.content.length);
        for (let i = 0; i < step.result.values.length; i++) {
          let value = step.result.values[i];
          checkResponse({
            expected: value,
            data: v.content[i],
          });
        }
      }
    }
  });
});
