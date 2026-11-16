# ion-modal focus recursion with stacked sheets

Minimal reproduction for an `@ionic/core` 9 bug. Presenting a second sheet modal
before the first sheet's `present()` resolves throws
`RangeError: Maximum call stack size exceeded`.

The page uses only `@ionic/core` and Vite, with no framework and no plugins.

## Run it

```sh
npm install
npx vite
```

Open the printed URL, open the browser console, and tap **Present both**. The
button calls `first.present()` without awaiting it, then `second.present()`. The
console shows the RangeError, with focus trap frames such as `trapKeyboardFocus` and
`focusFirstDescendant` at the top of the stack.

Add `?guard=1` to the URL to install the workaround listener from `main.js`. With
it, the error does not occur.

## What happens

1. When the first modal's enter animation ends, it focuses its wrapper. The second
   modal is already the topmost overlay.
2. The overlay focus trap (`trapShadowFocus`, a capture listener on `document`)
   sees focus outside the topmost overlay. The second modal has no element that
   matches `focusableQueryString`, so the trap focuses the second modal's host.
3. The first modal's `onModalFocus` sees its host focused with no focused element
   in its shadow root, and calls `dragHandleEl.focus()`.
4. The trap moves focus back to the second modal, and steps 3 and 4 repeat until
   the call stack overflows.

If the second modal contains a radio group, the trap focuses it through the async
`setFocus()`, and the loop does not start.

## Results

`run.mjs` loads the built page, taps the button and records page errors. Twenty
runs per cell, headless Playwright 1.65.0:

| `@ionic/core` | Chromium | WebKit | Chromium with `?guard=1` |
| --- | --- | --- | --- |
| 9.0.10 | 20 of 20 | 18 of 20 | 0 of 20 |
| 9.0.11 | 20 of 20 | 19 of 20 | 0 of 20 |
| 9.0.12-nightly.20261116 | 20 of 20 | 20 of 20 | 0 of 20 |

With `?guard=1`, WebKit on 9.0.10 also showed 0 of 20.

```sh
npm install && npx vite build && npx vite preview --port 4173
PW_DIR=<directory containing node_modules/playwright> node run.mjs chromium http://localhost:4173/ 20
```

This reproduction was prepared with the help of an AI assistant and verified by
running it in Chromium and WebKit.
