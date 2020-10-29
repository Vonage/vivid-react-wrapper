import './matchMediaMock'

import React from 'react';
import {mount} from 'enzyme'
import prepareVividWrapper, {propExists, propNameFromEvent, setDOMAttributes} from './wrapper'
import {setDOMListeners} from './utils'

describe('wrapper', () => {
  describe('event handling', () => {
    it('should pass event handler to web-component', () => {
      const VividButton = prepareVividWrapper('mwc-button', {
        events: ['change'],
      })
      const onChange = jest.fn()
      const container = mount(<VividButton onChange={onChange}/>)

      container.getDOMNode().dispatchEvent(new Event('change'))

      expect(onChange).toHaveBeenCalled()
    })

    it('should pass custom event handler to web-component', () =>{
      const VividButton = prepareVividWrapper('mwc-button',{
        events: ['customEvent'],
      })
      const onCustomEvent = jest.fn()
      const container = mount(<VividButton onCustomEvent={onCustomEvent}/>)

      container.getDOMNode().dispatchEvent(new Event('customEvent'))

      expect(onCustomEvent).toHaveBeenCalled()
    })

    it('should call custom event with event object', () => {
      const VividButton = prepareVividWrapper('mwc-button',{
        events: ['customEvent'],
      })
      const onCustomEvent = jest.fn()
      const container = mount(<VividButton onCustomEvent={onCustomEvent}/>)
      const event = new Event('customEvent')

      container.getDOMNode().dispatchEvent(event)

      expect(onCustomEvent).toHaveBeenCalledWith(event)
    })

    it('should call only configured events', () => {
      const VividButton = prepareVividWrapper('mwc-button',{
        events: ['customEvent'],
      })
      const onChange = jest.fn()
      const onCustomEvent = jest.fn()
      const container = mount(<VividButton
          onChange={onChange}
          onCustomEvent={onCustomEvent}
      />)
      const event = new Event('customEvent')
      const notConfiguredEvent = new Event('change')

      container.getDOMNode().dispatchEvent(event)
      container.getDOMNode().dispatchEvent(notConfiguredEvent)

      expect(onCustomEvent).toHaveBeenCalledWith(event)
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  describe('setDOMListeners', () => {
    it('should add listener for given prop', () =>{
      const props = {
        onChange: jest.fn()
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

      const remove = setDOMListeners(props, propName, currentEl, eventName)()

      expect(addListenerMock).toHaveBeenCalledTimes(1)
      expect(removeListenerMock).toHaveBeenCalledTimes(0)
      remove()

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

      setDOMAttributes(props, attributeName, currentEl)()

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

      setDOMAttributes(props, attributeName, currentEl)()

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

  describe('propNameFromEvent', () => {
    it('capitalizes only first letter and add "on" in the front', () => {
      const eventName = 'customEvent'
      const expectedPropName = 'onCustomEvent'

      expect(propNameFromEvent(eventName)).toBe(expectedPropName)
    })
  })
})



