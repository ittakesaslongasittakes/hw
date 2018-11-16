import xs from "xstream";
import concat from "xstream/extra/concat";

export const All = ({ DOM, onion, feathers }) => {
  const $ = onion.state$.debug("state");
  // const users = Users(onion);

  const getUsers$ = feathers
    .auth({ service: "users" })
    .map(data => state => ({ ...state, data }));

  const listener$ = feathers
    .select({
      service: "users",
      method: "created",
      type: "socket"
    })
    .map(newUser => state => {
      state.data.push(newUser);
      return {
        ...state
      };
    });

  const banners$ = feathers.banners({ service: "soul" }).map(data => state => {
    return {
      ...state,
      banners: data
    };
  });

  const userListener$ = feathers
    .select({
      service: "actions",
      method: "created",
      type: "socket"
    })
    .map(newAction => state => {
      return newAction.user === state.user
        ? { ...state, messages: state.messages + 1 }
        : state;
    });

  const prerender$ = DOM.select(".banner-wrap")
    .events("click")
    .map(ev => state => {
      console.log(ev.target.getAttribute("style"));
      console.log(state.user);
      feathers.show({
        service: "banners",
        msg: ev.target.getAttribute("style"),
        name: state.user
      });
      return {
        ...state
      };
    });

  const view$ = $.map(state => {
    const users = state.data;
    const messages = state.messages;
    const name = state.user;
    const eq = state.abData.filter(_ => _.name === state.user);
    const a = eq.filter(_ => _.a).length;
    const b = eq.filter(_ => _.b).length;
    return (
      <div>
        <div className="userinfo">
          <span className="userinfo-name">{name}</span>
          <span className="userinfo-actions">
            <div>
              {messages}
              <i>АКТИВНОСТЬ</i>
            </div>
          </span>
          <div className="banner">
            <span className="banners">Баннеры</span>
            <ul>
              {state.banners.map((banner: any, i) => (
                <li>
                  <i>{i + 1}</i>
                  <div className="banner-wrap" style={banner.props} />
                  <span>{i === 0 ? a : b}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="variants">
            <span className="banners">Рестайлинг</span>
          </div>
        </div>
        <ul className="users">
          {users.map(data => {
            return (
              <li className="user">
                {data.email !== "3e" ? data.email : "admin"}
              </li>
            );
          })}
          {/*<li>{state.newUser.email}</li>*/}
        </ul>
      </div>
    );
  });

  const userinfo$ = xs
    .combine(
      DOM.select(".user").events("click"),
      feathers.actions({ service: "actions" })
    )
    .map(([ev, data]) => state => {
      const messages = data.filter(data => data.user === ev.target.innerHTML)
        .length;
      return {
        ...state,
        user: ev.target.innerHTML,
        messages
      };
    });

  const abListener$ = feathers
    .select({
      service: "ab",
      method: "created",
      type: "socket"
    })
    .map(data => state => {
      let ab = state.abData;
      ab.push(data);
      const eq = ab.filter(_ => _.name === state.user);
      const a = eq.filter(_ => _.a).length;
      const b = eq.filter(_ => _.b).length;
      if (state.ab !== state._ab) {
        state._ab = state.ab;
        feathers.show({
          service: "banners",
          msg: state.banners[state.ab].props,
          name: state.user
        });
      }

      return {
        ...state,
        ab: a > b ? 0 : 1
      };
    });

  const abSearch$ = feathers.ab({ service: "ab" }).map(data => state => {
    const eq = data.filter(_ => _.name === state.user);
    const a = eq.filter(_ => _.a).length;
    const b = eq.filter(_ => _.b).length;
    const aa = state.banners[0];
    const bb = state.banners[1];
    state.ab === "a"
      ? feathers.show({
          service: "banners",
          msg: aa.props,
          name: state.user
        })
      : feathers.show({
          service: "banners",
          msg: bb.props,
          name: state.user
        });
    return {
      ...state,
      abData: data,
      ab: a > b ? 0 : 1,
      _ab: a > b ? 0 : 1
    };
  });

  return {
    DOM: view$,
    onion: xs.merge(
      getUsers$,
      listener$,
      userinfo$,
      userListener$,
      banners$,
      prerender$,
      abListener$,
      abSearch$
    )
  };
};
