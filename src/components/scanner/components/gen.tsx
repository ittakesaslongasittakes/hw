import xs from "xstream";
import $ from "jquery";
export const Gen = sources => {
  const genMenu$ = sources.onion.state$.map(state => {
    const cn = state.showGen ? "show" : "hide";
    return (
      <ul className={`gen-menu ${cn}`}>
        <li className="gen-create-elem">Create</li>
        <li className="gen-controller">Render</li>
        <li className="gen-send">Send</li>
        <li className="gen-save">Save</li>
      </ul>
    );
  });

  const genC$ = sources.onion.state$.map(state => {
    const cn = state.gen.html ? "show" : "hide";
    const css = state.gen.css;
    return <div className={`gen-elem ${cn}`} style={css} />;
  });

  const render$ = sources.onion.state$.map(state => {
    const cn = state.showRender ? "show" : "hide";
    const css = state.gen.css;
    return (
      <ul className={`gen-render ${cn}`}>
        <li>
          <label>Высота {css.height}</label>
          <input
            className="gen-h"
            type="range"
            min="1"
            max="500"
            value={css.height}
          />
        </li>
        <li>
          <label>Ширина {css.width}</label>
          <input
            className="gen-w"
            type="range"
            min="1"
            max="500"
            value={css.width}
          />
        </li>
        <li>
          <label>Графика</label>
          <input className="gen-img" type="text" placeholder="img" />
        </li>
      </ul>
    );
  });

  return {
    DOM: xs
      .combine(genMenu$, genC$, render$)
      .map(([menu, content, controller]) => {
        return (
          <div>
            {menu}
            {content}
            {controller}
          </div>
        );
      }),
    onion: xs.merge(
      sources.DOM.select(".gen-create-elem")
        .events("click")
        .map(ev => state => {
          return {
            ...state,
            gen: {
              ...state.gen,
              html: !state.gen.html
            }
          };
        }),
      sources.DOM.select(".gen-controller")
        .events("click")
        .map(ev => state => {
          return { ...state, showRender: !state.showRender };
        }),
      sources.DOM.select(".gen-h")
        .events("input")
        .map(ev => state => {
          const val = ev.target.value;
          return {
            ...state,
            gen: { ...state.gen, css: { ...state.gen.css, height: `${val}px` } }
          };
        }),
      sources.DOM.select(".gen-w")
        .events("input")
        .map(ev => state => {
          const val = ev.target.value;
          return {
            ...state,
            gen: { ...state.gen, css: { ...state.gen.css, width: `${val}px` } }
          };
        }),
      sources.DOM.select(".gen-img")
        .events("input")
        .map(ev => state => {
          const val = ev.target.value;
          return {
            ...state,
            gen: {
              ...state.gen,
              css: { ...state.gen.css, backgroundImage: `url(${val})` }
            }
          };
        })
    ),
    feathers: xs
      .combine(sources.DOM.select(".gen-send").events("click"))
      .map(_ => {
        const props = $(".gen-elem").attr("style");
        return {
          service: "soul",
          method: "create",
          args: [{ method: "banner", props }]
        };
      })
  };
};
