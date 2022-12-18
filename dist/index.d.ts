import { ForwardRefExoticComponent, RefObject } from 'react';
export declare type EventDefinition = {
    name: string;
    propName?: string;
    transform?: (value: unknown) => unknown;
};
export declare type AttributeDefinition = {
    name: string;
    setter?: (el: HTMLElement, attributeName: string, value: string) => void;
} | string;
export declare type ElementConfiguration = {
    events?: EventDefinition[];
    attributes?: AttributeDefinition[];
    properties?: string[];
};
export declare const attributeSetterValue: (el: HTMLElement, name: string, value: string) => void;
export declare const attributeSetterToggle: (el: HTMLElement, name: string, value: string) => void;
export declare const setDOMListeners: (props: Record<string, unknown>, propName: string, elementRef: RefObject<HTMLElement>, eventName: string, transform: (value: unknown) => unknown) => () => () => void | undefined;
export declare const setDOMAttributes: (props: Record<string, unknown>, attributeName: string, elementRef: RefObject<HTMLElement>, setter: (el: HTMLElement, attributeName: string, value: string) => void) => () => void;
export declare const propExists: (props: Record<string, unknown>, name: string) => boolean;
export declare const propNameFromEvent: (event: string | EventDefinition) => any;
/**
* Generates a React component that wraps around a custom element
* @param {string} elementTagName - The name of the registered custom element, with a prefix `xxx-my-cool-element`
* @param {ElementConfiguration} config - A configuration specification for the React wrapper
*/
declare const wrapper: (elementTagName: string, config?: ElementConfiguration) => ForwardRefExoticComponent<any>;
export default wrapper;
