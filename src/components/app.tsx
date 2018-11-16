import xs, { Stream } from "xstream";
import { StateSource } from "cycle-onionify";
import isolate from "@cycle/isolate";
import { extractSinks } from "cyclejs-utils";

import { driverNames } from "../drivers";
import { BaseSources, BaseSinks } from "../interfaces";
import { RouteValue, routes } from "../routes";

export interface Sources extends BaseSources {
  onion: StateSource<State>;
}
export interface Sinks extends BaseSinks {
  onion?: Stream<Reducer>;
}

// State
export interface State {
  scanner?: any;
  users?: any;
}
export const defaultState: State = {
  scanner: {
    json: {},
    showEq: false,
    showGen: false,
    showRender: false,
    eq: {
      tag: ".breadcrumb-navigation",
      size: 14
    },
    gen: {
      html: false,
      css: { width: "300px", height: "200px", backgroundImage: "none" }
    }
  },
  users: { messages: [], user: "Maggie Dennis" }
};
export type Reducer = (prev?: State) => State | undefined;

export function App(sources: Sources): Sinks {
  const initReducer$ = xs.of<Reducer>(
    prevState => (prevState === undefined ? defaultState : prevState)
  );

  const match$ = sources.router.define(routes);

  const componentSinks$ = match$.map(
    ({ path, value }: { path: string; value: RouteValue }) => {
      const { component, scope } = value;
      return isolate(component, scope)({
        ...sources,
        router: sources.router.path(path)
      });
    }
  );

  const sinks = extractSinks(componentSinks$, driverNames);
  return {
    ...sinks,
    onion: xs.merge(initReducer$, sinks.onion)
  };
}
