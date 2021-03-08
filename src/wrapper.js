import React, {useEffect, useRef} from "react";
import { flow, identity, isString, isUndefined, noop, pickBy, upperFirst } from 'lodash'

export const attributeSetterValue = (el, name, value) => el.setAttribute(name, value)
export const attributeSetterToggle = (el, name, value) => el[value === "true" ? "setAttribute" : "removeAttribute"](name, value);

// PRIVATE methods - exported for unit tests
export const setDOMListeners = (props, propName, currentEl, eventName, transform) => () => {
    if (propExists(props, propName)) {
        const el = currentEl.current
        const handler = flow(transform, props[propName] || noop);

        el.addEventListener(eventName, handler);
        return () => el.removeEventListener(eventName, handler);
    }
}
export const setDOMAttributes = (props, attributeName, currentEl, setter) => () => {
    const el = currentEl.current
    if(propExists(props,attributeName)){
        setter(el, attributeName, props[attributeName])
    }
}
export const propExists = (props, name) => !isUndefined(props[name])
export const propNameFromEvent = (event) => event.propName || ["on", upperFirst(event.name || event)].join('')

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

        const truthyProps = pickBy(props, (value) => value !== false)

        const currentEl = useRef(null)

        events.forEach((event) => {
            const eventName = isString(event) ? event : event.name
            const transform = isString(event)
                ? identity
                : (event.transform || identity)

            const propName = propNameFromEvent(event)

            useEffect(setDOMListeners(truthyProps, propName, currentEl, eventName, transform), [truthyProps[propName]])
        })

        attributes.forEach((attribute) => {
            const attributeName = isString(attribute) ? attribute : attribute.name
            const setter = isString(attribute)
                ? attributeSetterToggle
                : (attribute.setter || attributeSetterToggle)

            useEffect(setDOMAttributes(truthyProps, attributeName, currentEl, setter), [truthyProps[attributeName]])
        })

        properties.forEach((property) => {
            useEffect(() => {
                currentEl.current[property] = truthyProps[property]
            }, [truthyProps[property]])
        })

        return React.createElement(componentName, {
            ref: (el) => {
                currentEl.current = el
                if (typeof setRef === 'function') {
                    setRef(el)
                } else if (!!setRef && typeof setRef === 'object') {
                    setRef.current = el
                }
            },
            ...generateProps(truthyProps, events, attributes, properties)
        }, [], ...[].concat(children))
    })
}

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
