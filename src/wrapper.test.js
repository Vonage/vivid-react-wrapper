import React from 'react'
import { fireEvent, render, createEvent } from '@testing-library/react'
import prepareVividWrapper, {
  attributeSetterToggle,
  attributeSetterValue,
  propExists,
  setDOMAttributes,
  setDOMListeners,
} from './wrapper'
import { identity } from 'lodash'

describe('wrapper', () => {
  describe('event handling', () => {
    it('should pass event handler to web-component', () => {
      const VividButton = prepareVividWrapper('mwc-button', {
        events: [{ name: 'change', propName: 'onChange' }],
      })
      const onChange = jest.fn()
      const { container } = render(<VividButton onChange={onChange} />)
      fireEvent.change(container.querySelector('mwc-button'))

      expect(onChange).toHaveBeenCalled()
    })

    it('should pass proper event handler to web-component after handler change', () => {
      const VividButton = prepareVividWrapper('mwc-button', {
        events: [{ name: 'change', propName: 'onChange' }],
      })
      const onChange = jest.fn()
      const newOnChange = jest.fn()
      const event = new Event('change')
      const { container, rerender } = render(<VividButton onChange={onChange} />)
      rerender(<VividButton onChange={newOnChange} />)
      fireEvent.change(container.querySelector('mwc-button'))

      expect(newOnChange).toHaveBeenCalledWith(event)
      expect(onChange).not.toHaveBeenCalled()
    })

    it('should pass custom event handler to web-component', () => {
      const VividButton = prepareVividWrapper('mwc-button', {
        events: [{ name: 'customEvent', propName: 'onCustomEvent' }],
      })
      const onCustomEvent = jest.fn()
      const { container } = render(<VividButton onCustomEvent={onCustomEvent} />)

      const domElement = container.querySelector('mwc-button')
      fireEvent(domElement, createEvent(
        'customEvent', domElement
      ))

      expect(onCustomEvent).toHaveBeenCalled()
    })

    it('should call custom event with event object', () => {
      const VividButton = prepareVividWrapper('mwc-button', {
        events: [{ name: 'customEvent', propName: 'onCustomEvent' }],
      })
      const onCustomEvent = jest.fn()
      const { container } = render(<VividButton onCustomEvent={onCustomEvent} />)

      const domElement = container.querySelector('mwc-button')
      const event = createEvent(
        'customEvent', domElement
      )
      fireEvent(domElement, event)

      expect(onCustomEvent).toHaveBeenCalledWith(event)
    })

    it('should call only configured events', () => {
      const VividButton = prepareVividWrapper('mwc-button', {
        events: [{ name: 'customEvent', propName: 'onCustomEvent' }],
      })
      const onChange = jest.fn()
      const onCustomEvent = jest.fn()
      const { container } = render(<VividButton
        onChange={onChange}
        onCustomEvent={onCustomEvent}
      />)
      const domElement = container.querySelector('mwc-button')
      const event = createEvent(
        'customEvent', domElement
      )
      const notConfiguredEvent = createEvent(
        'change', domElement
      )
      fireEvent(domElement, event)
      fireEvent(domElement, notConfiguredEvent)

      expect(onCustomEvent).toHaveBeenCalledWith(event)
      expect(onChange).not.toHaveBeenCalled()
    })

    describe('transform', () => {
      it('should pass custom transform function', () => {
        const transformMock = jest.fn()
        const VividButton = prepareVividWrapper('mwc-button', {
          events: [{ name: 'change', propName: 'onChange', transform: transformMock }],
        })
        const onChange = jest.fn()
        const { container } = render(<VividButton onChange={onChange} />)
        const domElement = container.querySelector('mwc-button')
        const event = createEvent(
          'change', domElement
        )
        fireEvent(domElement, event)
        expect(transformMock).toHaveBeenCalledWith(event)
      })
    })
  })

  describe('attribute reading', () => {
    it('could read configured boolean attribute', () => {
      const VividButton = prepareVividWrapper('mwc-button', {
        attributes: ['bool'],
      })
      const { container } = render(<VividButton bool='true' />)
      const domElement = container.querySelector('mwc-button')

      expect(domElement.getAttribute('bool')).toBe('true')
    })

    it('could read configured string attribute', () => {
      const VividButton = prepareVividWrapper('mwc-button', {
        attributes: [{ name: 'string', setter: attributeSetterValue }],
      })
      const { container } = render(<VividButton string='name' />)
      const domElement = container.querySelector('mwc-button')

      expect(domElement.getAttribute('string')).toBe('name')
    })

    it('pass updated attribute', () => {
      const VividButton = prepareVividWrapper('mwc-button', {
        attributes: [{ name: 'string', setter: attributeSetterValue }],
      })
      const { container, rerender } = render(<VividButton string='name' />)
      const domElement = container.querySelector('mwc-button')
      rerender(<VividButton string='newName' />)
      expect(domElement.getAttribute('string')).toBe('newName')
    })
  })

  describe('passing reactive properties', () => {
    it('pass function property', () => {
      const transitionMock = jest.fn()
      const VividButton = prepareVividWrapper('mwc-button', {
        properties: ['transition'],
      })
      const { container } = render(<VividButton transition={transitionMock} />)
      const domElement = container.querySelector('mwc-button')
      domElement.transition('arg')
      expect(transitionMock).toHaveBeenCalledWith('arg')
    })

    it('changing function property', () => {
      const transitionMock = jest.fn()
      const newTransitionMock = jest.fn()
      const VividButton = prepareVividWrapper('mwc-button', {
        properties: ['transition'],
      })
      const { container, rerender } = render(<VividButton transition={transitionMock} />)
      const domElement = container.querySelector('mwc-button')
      rerender(<VividButton transition={newTransitionMock} />)
      domElement.transition('arg1')
      expect(transitionMock).not.toHaveBeenCalled()
      expect(newTransitionMock).toHaveBeenCalledWith('arg1')
    })
  })

  describe('setDOMListeners', () => {
    it('should add listener for given prop', () => {
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

      const remove = setDOMListeners(props, propName, currentEl, eventName, identity)()

      expect(addListenerMock).toHaveBeenCalledTimes(1)
      expect(removeListenerMock).toHaveBeenCalledTimes(0)
      remove()

      expect(removeListenerMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('setDOMAttributes', () => {
    describe('bool attributes', () => {
      it('should set attribute when it is provided in props', () => {
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

        setDOMAttributes(props, attributeName, currentEl, attributeSetterToggle)()

        expect(setMock).toHaveBeenCalledTimes(1)
      })

      it('should remove attribute when it is provided in props with false value', () => {
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

        setDOMAttributes(props, attributeName, currentEl, attributeSetterToggle)()

        expect(removeMock).toHaveBeenCalledTimes(1)
      })
    })
    describe('string attributes', () => {
      it('should set string attribute when it is provided in props', () => {
        const props = {
          'string': "name"
        }
        const attributeName = 'string'
        const setMock = jest.fn()
        const currentEl = {
          current: {
            setAttribute: setMock,
          }
        }

        setDOMAttributes(props, attributeName, currentEl, attributeSetterValue)()

        expect(setMock).toHaveBeenCalledTimes(1)
      })

      it('should not fire removeAttribute (miss with attributeSetterToggle)', () => {
        const props = {
          'string': false
        }
        const attributeName = 'string'
        const setMock = jest.fn()
        const removeMock = jest.fn()
        const currentEl = {
          current: {
            setAttribute: setMock,
            removeAttribute: removeMock
          }
        }

        setDOMAttributes(props, attributeName, currentEl, attributeSetterValue)()

        expect(setMock).toHaveBeenCalledTimes(1)
        expect(removeMock).toHaveBeenCalledTimes(0)
      })
    })
  })

  describe('propExists', () => {
    it('should return true when prop exists', () => {
      const props = {
        'test': true
      }
      const propName = 'test'

      const result = propExists(props, propName)

      expect(result).toBeTruthy()
    })

    it('should return false when prop does not exists', () => {
      const props = {
        'test': true
      }
      const propName = 'invalidName'

      const result = propExists(props, propName)

      expect(result).toBeFalsy()
    })
  })
})



