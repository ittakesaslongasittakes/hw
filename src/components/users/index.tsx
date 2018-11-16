import xs from "xstream";

import { All } from "./components/all";

export const Users = sources => {
  const $ = sources.onion.state$;
  const list = All(sources);
  const init$ = xs.of(
    prevState => (prevState === undefined ? Object : prevState)
  );
  return {
    DOM: xs
      .combine($, list.DOM)
      .map(([state, list]) => <div className="wrapper">{list}</div>),
    onion: xs.merge(init$, list.onion)
  };
};
