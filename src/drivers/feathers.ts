import xs from "xstream";
import Debug from "debug";
import Validate from "@gik/validate";
import io from "socket.io-client";
import feathers from "feathers/client";
import socketio from "feathers-socketio/client";
import hooks from "feathers-hooks";
import auth from "feathers-authentication-client";

export const makeFeathersDriver = server => {
  const debug = Debug("feathers:driver");
  const socket = io(server);
  const client = feathers()
    .configure(hooks())
    .configure(socketio(socket))
    .configure(auth({ storage: localStorage }));

  // client.service("users").create({strategy: "local", email: "3e", password: "3e"});
  client.authenticate({ strategy: "local", email: "3e", password: "3e" });

  const soul = client.service("soul");
  const msgs = client.service("messages");
  msgs.on("created", message => {
    console.log("Someone created a messages", message);
  });
  // Log newly created messages
  soul.on("created", message => {
    console.log("Someone created a messages", message);
  });

  // $.get("http://getcrm.ru/").done(data => {
  //   client.service("sources").create({ site: "http://getcrm.ru/", html: data });
  // }

    //TODD: dsadasda
    /*
    * TODO: вывести в div
    *
    * */

  const feathersDriver = sink$ => {
    sink$
      .map(sink => {
        Validate(sink, {
          service: { type: String, required: true },
          method: { type: String, required: true },
          args: { type: Array, value: [] }
        });
        const event = `${sink.service}::${sink.method}`;
        const service = client.service(sink.service);
        const method = service[sink.method];
        const args = sink.args || [];
        if (typeof method !== "function")
          throw new Error(
            `Invalid method '${sink.method}' for ${sink.service}`
          );
        debug(`sink request → ${event}`, args);
        return xs.fromPromise(service[sink.method](...args)).map(response => ({
          ...sink,
          response,
          event
        }));
      })
      .flatten()
      .addListener({
        error: error => {
          throw error;
        },
        next: sink => {
          console.log(sink);
          // emit locally
          debug(`sink response → ${sink.event}`, sink.response);
          client.emit(sink.event, sink.response);
        }
      });
    // The source stream that will handle the intents
    return {
      select: selector => {
        const { type, service, method } = Validate(selector, {
          service: { type: String, required: true },
          method: { type: String, required: true },
          type: { type: String, required: true }
        });
        const event = `${service}::${method}`;
        return xs.create({
          stop() {},
          start(listener) {
            const handler = response => {
              debug(`source ${type}:emitted → ${service}::${method}`, response);
              listener.next(response);
            };
            if (type == "local") client.on(event, handler);
            if (type == "socket") client.service(service).on(method, handler);
            debug(`source ${type}:added → ${event}`);
          }
        });
      },
      auth: selector => {
        const { service } = Validate(selector, {
          service: { type: String, required: true }
        });
        const p = Promise.resolve(
          client.authenticate({
            strategy: "local",
            email: "3e",
            password: "3e"
          })
        ).then(data => {
          const users = client.service(service).find({
            query: {
              $limit: 1000
            }
          });
          return Promise.resolve(users).then(data => data.data);
        });
        return xs.fromPromise(p);
      },
      ab: selector => {
        const { service } = Validate(selector, {
          service: { type: String, required: true }
        });
        const p = Promise.resolve(
          client.authenticate({
            strategy: "local",
            email: "3e",
            password: "3e"
          })
        ).then(data => {
          const users = client.service(service).find({
            query: {
              $limit: 1000
            }
          });
          return Promise.resolve(users).then(data => data.data);
        });
        return xs.fromPromise(p);
      },
      find: selector => {
        const { service } = Validate(selector, {
          service: { type: String, required: true }
        });
        return xs.fromPromise(
          client.service(service).find({
            query: {
              $limit: 1000
            }
          })
        );
      },
      show: selector => {
        const { service, msg, name } = Validate(selector, {
          service: { type: String, required: true },
          msg: { type: String, required: true },
          name: { type: String, required: true }
        });
        const date = new Date();
        return client
          .service(service)
          .create({ msg, name, date: date.getTime() });
      },
      banners: selector => {
        const { service } = Validate(selector, {
          service: { type: String, required: true }
          // name: { type: String, required: false }
        });
        console.log();
        const p = Promise.resolve(
          client.authenticate({
            strategy: "local",
            email: "3e",
            password: "3e"
          })
        ).then(data => {
          const users = client.service(service).find({
            query: {
              $limit: 100,
              method: {
                $in: ["banner"]
              }
            }
          });
          return Promise.resolve(users).then(data => data.data);
        });
        return xs.fromPromise(p);
      },
      actions: selector => {
        const { service } = Validate(selector, {
          service: { type: String, required: true }
          // name: { type: String, required: false }
        });
        console.log();
        const p = Promise.resolve(
          client.authenticate({
            strategy: "local",
            email: "3e",
            password: "3e"
          })
        ).then(data => {
          const users = client.service(service).find({
            query: {
              $limit: 100
            }
          });
          return Promise.resolve(users).then(data => data.data);
        });
        return xs.fromPromise(p);
      }
    };
  };
  return feathersDriver;
};
