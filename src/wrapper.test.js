import './matchMediaMock'
import regeneratorRuntime from "regenerator-runtime";

import React from 'react';
import { mount, shallow, debug } from 'enzyme'
import wrapper from './wrapper'
import "@vonage/vwc-button"


describe('wrapper', () =>{
  it('should generate correct wrapper for given configuration', () =>{
    const componentName= 'mwc-button'

    const configuration= {
      events: ['change', 'click'],
      attributes: ['disabled', 'label']
    }


    const onClick = jest.fn()
    const onChange = jest.fn()
    const label = 'Hi'

    const VividButton = wrapper(componentName,configuration)

    const container = 
      mount(
        <VividButton 
          onChange={onChange} 
          onClick={onClick}
          disabled={true}
          enlarged={true}
          label={label}
        >
          Hello  
        </VividButton>
      );
    console.log(container.debug())

    container.simulate('click')

    const buttonComponent = container.find('button')
    //buttonComponent.simulate('click')
    console.log(buttonComponent.debug())

    expect(onClick).toBeCalled()
  })
})

