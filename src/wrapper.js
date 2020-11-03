import React, {useEffect, useRef} from "react";
import {flow, identity, isString, isUndefined, noop} from "lodash";

/**
* Generates a React component that wraps around a custom element
* @param {string} componentName - The name of the registered custom element
* @param {Object} configuration - A configuration specification for the React wrapper
* @param {Array} configuration.events - A List of events that the element supports
* @param {Array} configuration.attributes - A List of attributes that the element supports
* @param {Array} configuration.properties - A List of properties that the element supports
*/
const wrapper = function(
    componentName,
    {
        events = [],
        attributes = [],
        properties = []
    } = {}
){
    return React.forwardRef(({ children = [], ...props }, setRef) => {

        const currentEl = useRef(null)

        const eventProps = events.map((event) => {
            const eventName = propNameFromEvent(event);
            return props[eventName]
        })
        useEffect(setDOMListeners(props, events, currentEl), eventProps)

        const attributeProps = attributes.map((attribute) => {
            const attributeName = isString(attribute) ? attribute : attribute.name
            return props[attributeName];
        })
        useEffect(setDOMAttributes(props, attributes, currentEl), attributeProps)

        const propertiesProps = properties.map((property) => props[property])
        useEffect(() => {
            properties.forEach((property) => {
                currentEl.current[property] = props[property]
            })
        }, propertiesProps)

        return React.createElement(componentName, {
            ref: (el) => {
                (setRef || noop)(el)
                currentEl.current = el
            },
            ...generateProps(props,events,attributes, properties)
        }, [], ...children)
    })
}

export const attributeSetterValue = (el, name, value) => el.setAttribute(name, value)
export const attributeSetterToggle = (el, name, value) => el[value === "true" ? "setAttribute" : "removeAttribute"](name, value);

const setDOMListeners = (props, events, currentEl) => () => {
    const cleaningFns = events.map((event) => {
        const eventName = isString(event) ? event : event.name
        const transform = isString(event)
            ? identity
            : (event.transform || identity)

        const propName = propNameFromEvent(event)

        return setDOMListener(props, propName, currentEl, eventName, transform)
    })
    return () => cleaningFns.forEach((fn) => fn())
}

const setDOMAttributes = (props, attributes, currentEl) => () => {
    attributes.forEach((attribute) => {
        const attributeName = isString(attribute) ? attribute : attribute.name
        const setter = isString(attribute)
            ? attributeSetterToggle
            : (attribute.setter || attributeSetterToggle)
        setDOMAttribute(props, attributeName, currentEl, setter)
    })
}

export const setDOMListener = (props, propName, currentEl, eventName, transform) => {
    const el = currentEl.current
    if (el && propExists(props, propName)) {
        const handler = flow(transform, props[propName] || noop);

        el.addEventListener(eventName, handler);
        return () => el.removeEventListener(eventName, handler);
    }
}

export const setDOMAttribute = (props, attributeName, currentEl, setter) => {
    const el = currentEl.current
    if(propExists(props,attributeName)){
        setter(el, attributeName, props[attributeName])
    }
}

export const propExists = (props, name) => !isUndefined(props[name])
export const propNameFromEvent = (event) => event.propName
const propNameFromAttribute = (attrib) => attrib.name || attrib

const generateProps = (actualPropsPassed, events, attributes, properties) =>{
    const propNames = [...Object.keys(actualPropsPassed)]

    const attributesAndEvents = [
        ...events.map(propNameFromEvent),
        ...attributes.map(propNameFromAttribute),
        ...properties // overrides
    ]

    
    return propNames
            .filter((propName) => !attributesAndEvents.includes(propName))
            .reduce(toObjectOf(actualPropsPassed), {})
}

const toObjectOf = (props) => (ac, name) => ({...ac, [name]: props[name] })

export default wrapper