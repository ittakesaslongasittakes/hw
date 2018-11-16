import xs from "xstream";
var html2json = require("html2json").html2json;

export const Nav = sources => {

  // const toState$ = xs
  //   .combine(
  //     sources.DOM.select(".target-site-state").events("click"),
  //     sources.feathers
  //       .find({ service: "messages" })
  //       .map(res => state => res.data)
  //   )
  //   .map(([click, find]) => find);

  const tags$ = sources.DOM.select(".target-site-tags")
    .events("click")
    .map(ev => state => {
      const json = html2json(state[0].html);
      return {
        ...state,
        json
      };
    });
  const scrapCss$ = sources.DOM.select(".target-site-css-scrapper")
    .events("click")
    .map(ev => state => {
      const regexp = /.css/gi;
      const site = state[0].html;
      const findIndexes = _ => {
        const csss = [];
        var result;
        while ((result = regexp.exec(_))) {
          csss.push(result.index);
        }
        return csss;
      };
      const firstChar = i => (site.charAt(i) === "<" ? i : firstChar(i - 1));
      const lastChar = i => (site.charAt(i) === ">" ? i + 1 : lastChar(i + 1));

      const css = findIndexes(site).map(i =>
        site.substring(firstChar(i), lastChar(i))
      );
      state[0].css = css;
      return state[0];
    });

  const eq$ = sources.DOM.select(".target-site-eq")
    .events("click")
    .map(ev => _ => ({ ..._, showEq: !_.showEq }));

  const gen$ = sources.DOM.select(".target-site-gen")
    .events("click")
    .map(ev => _ => ({ ..._, showGen: !_.showGen }));
  return {
    DOM: xs.of(
      <ul className="nav">
        <li className="target-site">Site</li>
        <li className="target-site-state">State</li>
        <li className="target-site-css-scrapper">CSS</li>
        <li className="target-site-tags">Tags</li>
        <li className="target-site-eq">Eq</li>
        <li className={`target-site-gen`}>Gen</li>
      </ul>
    ),
    onion: xs.merge(tags$, scrapCss$, eq$, gen$)
  };
};
