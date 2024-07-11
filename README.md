> This README is for developers and people interested in learning more about q2view. If you just need the functionality, q2view is already compiled and hosted at [https://view.qiime2.org](https://view.qiime2.org)
> The live version of the app officially supports the latest versions of Google Chrome and Firefox.

# q2view

This HTML 5 interface provides a way to view `.qza`/`.qzv` files produced by
QIIME 2. It provides:
  - Inspection of basic metadata
  - Viewing of complex web-based visualizations
  - Inspection of provenance

This interface uses the [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
to "hoist" the contents of a `.qzv`'s `/data` directory into the interface
allowing relative links within a visualization to work via standard HTTP
requests.

To host the app locally, first install the dependencies (while in root of the repo):
```
npm install
```
Then run:
```
npm run dev
```
This will host the app on localhost:5173 by default
**Important:** HTTPS is required (by service worker API) when not hosting
from `localhost`.

**NOTE**: The locally hosted version of the app will most likely not work on Firefox due to the way Firefox interacts with the afformentioned Service Worker API.
