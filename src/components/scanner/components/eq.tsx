import xs from "xstream";
export const Eq = sources => {
  const eq$ = sources.onion.state$.map(state => {
    const cn = state.showEq ? "show" : "hide";
    const fSize = state.eq.size;
    return (
      <div className={`eq ${cn}`}>
        <div className="eq-header">
          <label>Элемент</label>
          <input
            type="text/html"
            placeholder="id/class элемента"
            value={state.eq.tag}
          />
        </div>
        <div className="eq-controller eq-fontsize">
          <label>Высота букв {fSize} px</label>
          <input type="range" min="0" value={fSize} />
        </div>
        <button className="okgo">Отправить</button>
      </div>
    );
  });
  return {
    DOM: eq$,
    onion: xs.merge(
      sources.DOM.select(".eq-fontsize input")
        .events("input")
        .map(ev => state => ({
          ...state,
          eq: { ...state.eq, size: ev.target.value }
        })),
      sources.DOM.select(".eq-header input")
        .events("input")
        .map(ev => state => {
          return {
            ...state,
            eq: { ...state.eq, tag: ev.target.value }
          };
        })
    ),
    feathers: xs
      .combine(
        sources.DOM.select(".okgo").events("click"),
        sources.onion.state$.map(state => [state.eq.tag, state.eq.size])
      )
      .map(([ev, state]) => {
        return {
          service: "soul",
          method: "create",
          args: [{ tag: state[0], size: state[1] }]
        };
      })
  };
};
