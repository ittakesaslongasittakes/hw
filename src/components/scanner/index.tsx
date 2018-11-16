import xs from "xstream";
import { Nav } from "./components/nav";
import { Eq } from "./components/eq";
import { Gen } from "./components/gen";

export const Scanner = sources => {
  const nav = Nav(sources);
  const eq = Eq(sources);
  const gen = Gen(sources);
  const init$ = xs.of(
    prevState => (prevState === undefined ? Object : prevState)
  );

  return {
    DOM: xs
      .combine(sources.onion.state$.debug("state"), nav.DOM, eq.DOM, gen.DOM)
      .map(([state, nav, eq, gen]) => (
        <div className="wrapper">
          {nav}
          <div className="content">
            {eq}
            {gen}
          </div>
        </div>
      )),
    onion: xs.merge(init$, nav.onion, eq.onion, gen.onion),
    feathers: xs.merge(eq.feathers, gen.feathers)
  };
};
