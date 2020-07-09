import { capitalize } from "lodash";
import "@material/mwc-formfield";
import "@material/mwc-checkbox";
import "@material/mwc-textarea";
import kefir from "kefir";
import React, { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import "document";
import "window";

/*
const component = ({ disabled, raised, onChange })=> {
    return React.createElement('mwc-checkbox', { onChange }, ["Hello World"]);
    //return React.createElement('button', { disabled }, ["Hello World"]);
};

const render = function({ disabled, raised, onChange }){
    ReactDOM.render(React.createElement(component, { disabled, raised, onChange }, []), document.body);
};

const squareWaveProperty = kefir
    .repeat(()=> kefir.sequentially(1000, [true, false]))
    .toProperty(()=> false);

const onChange = (e)=>{
    console.log('Click', e);
}

kefir
    .combine([squareWaveProperty, squareWaveProperty])
    .onValue(([disabled, raised])=>{
        render({ raised, onChange });
    });*/

/*const el = document.createElement('mwc-checkbox');
el.innerText = "Hello World";
document.body.appendChild(el);
el.addEventListener('change', console.log);*/

const el = document.createElement('main');
document.body.appendChild(el);

const wrapComponent = (
    componentName,
    { eventNames = [], attributeNames = [] } = {}
)=> {
    const scan = function(wrapped){
        let prevArg;
        return function(arg, ...rest){
            wrapped(arg, prevArg, ...rest);
            prevArg = arg;
        }
    };

    const handlerMap = new Map();

    eventNames.forEach((eventName)=>{
        handlerMap.set(eventName, scan((newHandler, previousHandler, element)=>{
            element.removeEventListener(eventName, previousHandler);
            element.addEventListener(eventName, newHandler);
            return ()=> element.removeEventListener(eventName, curHandler);
        }));
    });

    return ({ children, ...props })=> {

        const currentEl = useRef(null);

        /*useEffect(()=> {
            return ()=> console.log('Unmounted');
        }, []);*/

        eventNames.forEach((eventName)=> {
            const propName = ["on", _.capitalize(eventName)].join('');
            useEffect(()=> handlerMap.get(eventName)(props[propName], currentEl.current), [props[propName]]);
        });

        return React
            .createElement(componentName, { ref: currentEl }, [], ...children);
    }
};

const
    myFormField = wrapComponent('wmc-formfield', { eventNames: ["change", "click"] }),
    myCheckbox = wrapComponent('mwc-checkbox', { eventNames: ["change", "click"] }),
    myTextArea = wrapComponent('mwc-textarea', { eventName: ["change"] });

ReactDOM.render(
    React.createElement(myTextArea, {
        onChange: console.log,
        ref: console.log
    }, ["Hello"]),
    el
);

/*ReactDOM.render(
    React.createElement('div', {
        onChange: console.log
    }, ["Hello"]),
    el
);*/

/*ReactDOM.render(
    React.createElement(myCheckbox, {
        onClick: ()=> console.log('Click'),
        onChange: ()=> { console.log('a'); }
        } , ["Hello"]),
    el
);*/
