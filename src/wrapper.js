import React, {useEffect, useRef} from "react";
import {capitalize, flow, identity, isString, isUndefined, noop} from "lodash";

const
    attributeSetterValue = (el, name, value)=> el.setAttribute(name, value),
    attributeSetterToggle = (el, name, value)=> el[value === "true" ? "setAttribute" : "removeAttribute"](name, value);

/**
* Generates a React component that wraps around a custom element
* @param {string} componentName - The name of the registered custom element
* @param {Object} configuration - A configuration specification for the React wrapper
* @param {Object} configuration.events - A List of events that the element supports
* @param {Object} configuration.attributes - A List of attributes that the element supports
*/
const wrapper = function(
    componentName,
    {
        events = [],
        attributes = []
    } = {}
){
    return React.forwardRef(({ children = [], ...props }, setRef)=> {

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
            },
            ...Object.keys(props)
                    .filter((
                        (fields)=> (name)=> !fields.includes(name)
                    )([
                        ...events.map((event)=> ["on", capitalize(event.name || event)].join('')),
                        ...attributes.map((attrib)=> attrib.name || attrib),
                    ]))
                    .reduce((ac, name)=> Object.assign(ac, { [name]: props[name] }), {})
        }, [], ...children);
    });
};

export default wrapper;
export { attributeSetterValue, attributeSetterToggle };