import React, { useEffect, useRef } from "react";
import {upperFirst, isString, isUndefined, noop, identity} from "lodash";
import { setDOMListeners } from "./utils";


export const attributeSetterValue = (el, name, value)=> el.setAttribute(name, value)
export const attributeSetterToggle = (el, name, value)=> el[value === "true" ? "setAttribute" : "removeAttribute"](name, value);

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
    return React.forwardRef(({ children = [], ...props }, setRef) => {

        const currentEl = useRef(null)

        events.forEach((event) => {

            const eventName = isString(event) ? event : event.name
            const transform = isString(event)
                ? identity
                : (event.transform || identity)

            const propName = propNameFromEvent(event)

            useEffect(setDOMListeners(props, propName, currentEl, eventName, transform), [props[propName]])
        })

        attributes.forEach((attribute) => {
            const attributeName = isString(attribute) ? attribute : attribute.name
            const setter = isString(attribute)
                ? attributeSetterToggle
                : (attribute.setter || attributeSetterToggle)

                useEffect(setDOMAttributes(props, attributeName, currentEl, setter), [props[attributeName]])
        })

        return React.createElement(componentName, {
            ref: (el) => {
                (setRef || noop)(el)
                currentEl.current = el
            },
            ...generateProps(props,events,attributes)
        }, [], ...children)
    })
}

export const setDOMAttributes = (props, attributeName, currentEl, setter) => () => {
    const el = currentEl.current
    if(propExists(props,attributeName)){
        setter(el, attributeName, props[attributeName])
    }
}

export const propExists = (props, name) => !isUndefined(props[name])
export const propNameFromEvent = (event)=> ["on", upperFirst(event.name || event)].join('')
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

export default wrapper