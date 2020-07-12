import React, {useEffect, useRef} from "react";
import {capitalize, flow, identity, isString, isUndefined, noop} from "lodash";

const
    attributeSetterValue = (el, name, value)=> el.setAttribute(name, value),
    attributeSetterToggle = (el, name, value)=> el[!!value ? "setAttribute" : "removeAttribute"](name, value);

const wrapper = function(
    componentName,
    {
        events = [],
        attributes = []
    } = {}
){

    return React.forwardRef(({ children, ...props }, setRef)=> {

        const currentEl = useRef(null);

        events.forEach((event)=> {
            const
                { name: eventName, transform = identity } = isString(event) ? { name: event, transform: identity } : event,
                propName = ["on", capitalize(eventName)].join('');

            useEffect(()=> {
                if(!isUndefined(props[propName])){
                    const
                        el = currentEl.current,
                        handler = flow(transform, props[propName] || noop);

                    el.addEventListener(eventName, handler);
                    return ()=> el.removeEventListener(eventName, handler);
                }

            }, [props[propName]]);
        });

        attributes.forEach((attribute)=> {
            const { name: attributeName, setter = attributeSetterToggle } = isString(attribute) ? { name: attribute, setter: attributeSetterToggle } : attribute;
            useEffect(()=> {
                const el = currentEl.current;
                if(!isUndefined(props[attributeName])){
                    setter(el, attributeName, props[attributeName]);
                }
            }, [props[attributeName]]);
        });

        return React.createElement(componentName, {
            ref: (el)=> {
                (setRef || noop)(el);
                currentEl.current = el;
            }
        }, [], ...children);
    });
};

export default wrapper;
export { attributeSetterValue, attributeSetterToggle };