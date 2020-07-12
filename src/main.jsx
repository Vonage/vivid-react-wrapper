import React from "react";
import ReactDOM from "react-dom";
import "@material/mwc-textarea";
import wrapper from "./wrapper";
import { attributeSetterValue, attributeSetterToggle } from "./wrapper";

const MwcTextarea = wrapper('mwc-textarea',  {
    events: [
        { name: "change", transform: (e)=> e.target.value }
    ],
    attributes: [
        { name: "disabled", setter: attributeSetterToggle },
        { name: "placeholder", setter: attributeSetterValue }
    ]
});

ReactDOM.render(
    <MwcTextarea disabled="true" onClick={ console.log } onChange={ console.log } ref={ console.log } value="hello"></MwcTextarea>,
    document.body
);



