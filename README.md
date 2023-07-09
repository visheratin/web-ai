# Web AI

Web AI is a TypeScript library that allows you to run modern deep learning models directly in the web browser or in Node.js. You can easily add AI capabilities to your web applications without the need for complex server-side infrastructure or third-party APIs.

Features:

- Easy to use. Create a model with one line of code, get the result with another one.
- Powered by [ONNX runtime](https://onnxruntime.ai/). Web AI runs the models using ONNX Runtime, which has rich support for of all kinds of operators. It means that any model will work just fine.
- Built-in caching. When using in the browser, Web AI stores the downloaded models in IndexedDB using [localforage](https://github.com/localForage/localForage). You can configure the size of the cache dynamically.
- Web worker support. All heavy operations - model creation and inference - are offloaded to a separate thread so the UI does not freeze.

More information about how to use the library can be found in the [wiki](https://github.com/visheratin/web-ai/wiki).

## How to install

The library can be installed via `npm`.

Browser version:

```bash
npm install @visheratin/web-ai
```

Node.js version:

```bash
npm install @visheratin/web-ai-node
```

## Status

The library is under active development. If something does not work correctly, please file an issue on GitHub. Contributions are very welcome.

## Sponsors

- Continuing work on this project is sponsored by [Reflect](https://reflect.app/home) - awesome app for taking notes.
- Thanks to AlgoveraAI for the grant under their AI project financing [program](https://docs.algovera.ai/docs/Handbook/Grants/Introduction).
