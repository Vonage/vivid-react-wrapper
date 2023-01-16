# React Custom Element Wrapper

This utility library creates a React component that serves as a wrap around a custom element.
 It is used to relay custom events that are not natively supported to callback properties as well as manage attributes and properties on a custom element.

## **Getting Started**

To install react wrapper in your project, run:

```npm i @vonage/vivid-react-wrapper```

In order to use it in your code, just import the wrapper function into your project, then invoke it with the configuration that's relevant to the element you're wrapping.

```javascript
import React from "react";
import ReactDOM from "react-dom";
import "@material/mwc-textarea";
import wrapper from "@vonage/vivid-react-wrapper";

const MwcTextarea = wrapper('mwc-textarea',  {
    events: ["change"],
    attributes: ["disabled"]
});
```

Then you can use the generated component as you would any other React component. Supplying callbacks for events and attribute values as properties:

```javascript
ReactDOM.render(
    <MwcTextarea disabled="true" onClick={ console.log } onChange={ console.log } ref={ console.log } value="hello"></MwcTextarea>,
    document.body
);
```

The wrapper function takes two arguments
* The name of the custom element to wrap
* An options object containing two fields:
  * `events`: An array of events that the wrapper should handle. For instance, the "change" event isn't handled by React automatically, so we'd want to add "onChange" to the list of events. To consume these events, all you need is to assign a callback property "onChange" to the React element instance.
  * `attributes`: An array of attributes that the wrapper should relay to the element. Some element attributes are assigned/removed instead of set value to (as in the case of the "disabled" attribute).

All properties that have not been explicitly configured to be handled by the wrapper, including "ref" will be transferred to the element natively by React.

## Extended Configuration

```javascript
import "@material/mwc-textarea";
import wrapper, { attributeSetterValue, attributeSetterToggle } from "@vonage/vivid-react-wrapper";

const MwcTextarea = wrapper('mwc-textarea',  {
    events: [
        { name: "change", propName: 'onChange', transform: (e) => e.target.value }
    ],
    attributes: [
        { name: "disabled", setter: attributeSetterToggle },
        { name: "placeholder", setter: attributeSetterValue }
    ]
});
```

## Releasing new version

* Bump the version in `package.json` commit & push the change to the master
* Run `Pipeline` workflow manually