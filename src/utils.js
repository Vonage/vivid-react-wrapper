import { flow } from "lodash";
import { propExists } from "./wrapper";

export const setDOMListeners = (props, propName, currentEl, eventName, transform) => () => {
  if(propExists(props,propName)){
      const el = currentEl.current
      const handler = flow(transform, props[propName] || noop);

      el.addEventListener(eventName, handler);
      return ()=> el.removeEventListener(eventName, handler);
  }
}