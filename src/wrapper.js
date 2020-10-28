import React, {useEffect, useRef} from "react";
import {capitalize, flow, identity, isString, isUndefined, noop} from "lodash";


const attributeSetterValue = (el, name, value)=> el.setAttribute(name, value)
const attributeSetterToggle = (el, name, value)=> el[value === "true" ? "setAttribute" : "removeAttribute"](name, value);

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

            const eventName = isString(event) ? event : event.name 
            const transform = identity

            const propName = propNameFromEvent(event);


            useEffect(setDOMListeners(props, propName, currentEl, transform, eventName), [props[propName]]);
        });

        attributes.forEach((attribute)=> {
            const attributeName = isString(attribute) ? attribute : attribute.name

            useEffect(setDOMAttributes(props, attributeName, currentEl), [props[attributeName]]);
        });

        return React.createElement(componentName, {
            ref: (el)=> {
                (setRef || noop)(el);
                currentEl.current = el;
            },
            ...generateProps(props,events,attributes)
        }, [], ...children);
    });
};
const setDOMAttributes = (props, attributeName, currentEl) => () => {
    const el = currentEl.current;
    if(propExists(props,attributeName)){
        attributeSetterToggle(el, attributeName, props[attributeName]);
    }
}

const propExists = (props, name) => !isUndefined(props[name])

const setDOMListeners = (props, propName, currentEl, transform, eventName) => () => {
    if(propExists(props,propName)){
        const el = currentEl.current
        const handler = flow(transform, props[propName] || noop);

        el.addEventListener(eventName, handler);
        return ()=> el.removeEventListener(eventName, handler);
    }

}


const propNameFromEvent = (event)=> ["on", capitalize(event.name || event)].join('')

const propNameFromAttribute = (attrib)=> attrib.name || attrib


const generateProps = (props, events, attributes) =>{
    const propNames = [...Object.keys(props)]


    const attributesAndEvents = [
        ...events.map(propNameFromEvent),
        ...attributes.map(propNameFromAttribute),
    ]

    
    return propNames
            .filter((propName) => !attributesAndEvents.includes(propName))
            .reduce(toObjectOf(props), {})
}

const toObjectOf = (props) => (ac, name) => ({...ac, [name]: props[name] })

export default wrapper;
export { attributeSetterValue, attributeSetterToggle };