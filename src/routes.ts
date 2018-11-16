import { Component } from "./interfaces";
import { Scanner } from "./components/scanner";
import { Users } from "./components/users";

export interface RouteValue {
  component: Component;
  scope: string;
}
export interface Routes {
  readonly [index: string]: RouteValue;
}

export const routes: Routes = {
  "/": { component: Scanner, scope: "scanner" },
  "/users": { component: Users, scope: "users" }
};

export const initialRoute = "/";
