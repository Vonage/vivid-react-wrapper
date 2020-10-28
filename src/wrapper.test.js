import './matchMediaMock'
import regeneratorRuntime from "regenerator-runtime";

import React from 'react';
import { mount, shallow, debug } from 'enzyme'
import wrapper from './wrapper'
import "@vonage/vwc-button"
import { before, remove } from 'lodash';
import {setDOMListeners} from './utils'
import { setDOMAttributes, propExists} from './wrapper'


describe('wrapper', () =>{
  afterEach(() => {    
    jest.clearAllMocks();
  });
  it('should call useEffect for each event and atribute defined in configuration', () =>{
    const componentName= 'mwc-button'
    const configuration= {
      events: [ 'change','click','submit'],
      attributes: ['disabled', 'label']
    }
    const useEffect = jest.spyOn(React, "useEffect");
    const VividButton = wrapper(componentName,configuration)

    const container = shallow(<VividButton />);

    expect(useEffect).toHaveBeenCalledTimes(5)
  })
})

describe('setDOMListeners', () => {
  it('should add listener for given prop', () =>{
    const props = {
      'onChange': jest.fn()
    }
    const propName = 'onChange'
    const addListenerMock = jest.fn()
    const removeListenerMock = jest.fn()
    const currentEl = {
      current: {
        addEventListener: addListenerMock,
        removeEventListener: removeListenerMock
      }
    }
    const eventName = 'change'

    const result = setDOMListeners(props, propName, currentEl, eventName)()

    expect(addListenerMock).toHaveBeenCalledTimes(1)
    expect(removeListenerMock).toHaveBeenCalledTimes(0)
    result()

    expect(removeListenerMock).toHaveBeenCalledTimes(1)
  })
})

describe('setDOMAttributes', () => {
  it('should set attribute when it is provided in props', () =>{
    const props = {
      'disabled': "true"
    }
    const attributeName = 'disabled'
    const setMock = jest.fn()
    const removeMock = jest.fn()
    const currentEl = {
      current: {
        setAttribute: setMock,
        removeAttribute: removeMock
      }
    }
    const eventName = 'change'

    const result = setDOMAttributes(props, attributeName, currentEl)()

    expect(setMock).toHaveBeenCalledTimes(1)
  })
  it('should remove attribute when it is provided in props with false value', () =>{
    const props = {
      'disabled': false
    }
    const attributeName = 'disabled'
    const setMock = jest.fn()
    const removeMock = jest.fn()
    const currentEl = {
      current: {
        setAttribute: setMock,
        removeAttribute: removeMock
      }
    }
    const eventName = 'change'

    const result = setDOMAttributes(props, attributeName, currentEl)()

    expect(removeMock).toHaveBeenCalledTimes(1)
  })
})

describe('propExists', () => {
  it('should return true when prop exists', () =>{
    const props= {
      'test': true
    }
    const propName= 'test'

    const result = propExists(props,propName)

    expect(result).toBeTruthy()
  })

  it('should return false when prop does not exists', () =>{
    const props= {
      'test': true
    }
    const propName= 'invalidName'

    const result = propExists(props,propName)

    expect(result).toBeFalsy()
  })
})
