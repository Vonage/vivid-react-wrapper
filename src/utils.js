import { flow, identity } from "lodash";
import { propExists } from "./wrapper";

export const setDOMListeners = (props, propName, currentEl, eventName) => () => {
  if(propExists(props,propName)){
      const el = currentEl.current
      const handler = flow(identity, props[propName] || noop);

      el.addEventListener(eventName, handler);
      return ()=> el.removeEventListener(eventName, handler);
  }
}