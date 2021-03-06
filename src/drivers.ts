import { restartable } from "cycle-restart";
import { makeDOMDriver } from "@cycle/dom";
import { makeHTTPDriver } from "@cycle/http";
import { makeHistoryDriver } from "@cycle/history";
import { timeDriver } from "@cycle/time";
import { routerify } from "cyclic-router";
import onionify from "cycle-onionify";
import storageify from "cycle-storageify";
import switchPath from "switch-path";
import storageDriver from "@cycle/storage";

import { Component } from "./interfaces";
import { makeFeathersDriver } from "./drivers/feathers";

export type DriverThunk = Readonly<[string, () => any]> & [string, () => any]; // work around readonly
export type DriverThunkMapper = (t: DriverThunk) => DriverThunk;

// Set of Drivers used in this App
const driverThunks: DriverThunk[] = [
  ["DOM", () => makeDOMDriver("#app")],
  ["HTTP", () => makeHTTPDriver()],
  ["time", () => timeDriver],
  ["history", () => makeHistoryDriver()],
  ["storage", () => storageDriver],
  ["feathers", () => makeFeathersDriver("http://localhost:3030")]
];

export const buildDrivers = (fn: DriverThunkMapper) =>
  driverThunks
    .map(fn)
    .map(([n, t]: DriverThunk) => ({ [n]: t }))
    .reduce((a, c) => Object.assign(a, c), {});

export const driverNames = driverThunks
  .map(([n, t]) => n)
  .concat(["onion", "router"]);

export function wrapMain(main: Component): Component {
  return routerify(
    onionify(
      storageify(main as any, {
        key: "cycle-spa-state",
        debounce: 100 // wait for 100ms without state change before writing to localStorage
      })
    ),
    switchPath
  ) as any;
}
