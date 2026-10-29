import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { trapDialogFocus } from '../src/lib/dialogFocus.ts'

test('modal Tab wraps from the last control to the first and Shift+Tab wraps back', () => {
  const dom = new JSDOM('<button id="outside">Outside</button><div id="dialog" tabindex="-1"><button id="first">Close</button><select><option>All</option></select><button id="last">Show results</button><button disabled>Disabled</button><button hidden>Hidden</button></div>')
  const doc = dom.window.document
  const dialog = doc.getElementById('dialog')
  doc.getElementById('last').focus()
  const forward = new dom.window.KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
  trapDialogFocus(forward, dialog)
  assert.equal(forward.defaultPrevented, true)
  assert.equal(doc.activeElement.id, 'first')
  const reverse = new dom.window.KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true })
  trapDialogFocus(reverse, dialog)
  assert.equal(doc.activeElement.id, 'last')
  doc.getElementById('outside').focus()
  trapDialogFocus(new dom.window.KeyboardEvent('keydown', { key: 'Tab', cancelable: true }), dialog)
  assert.equal(doc.activeElement.id, 'first')
  dom.window.close()
})

test('modal focus handling leaves interior navigation and other keys alone', () => {
  const dom = new JSDOM('<div id="dialog"><button id="first">First</button><button>Last</button></div>')
  const dialog = dom.window.document.getElementById('dialog')
  dom.window.document.getElementById('first').focus()
  for (const key of ['Tab', 'ArrowDown']) {
    const event = new dom.window.KeyboardEvent('keydown', { key, cancelable: true })
    trapDialogFocus(event, dialog)
    assert.equal(event.defaultPrevented, false)
  }
  dom.window.close()
})

test('a temporarily empty modal retains keyboard focus safely', () => {
  const dom = new JSDOM('<div id="dialog" tabindex="-1"></div>')
  const dialog = dom.window.document.getElementById('dialog')
  const event = new dom.window.KeyboardEvent('keydown', { key: 'Tab', cancelable: true })
  trapDialogFocus(event, dialog)
  assert.equal(event.defaultPrevented, true)
  assert.equal(dom.window.document.activeElement, dialog)
  dom.window.close()
})
