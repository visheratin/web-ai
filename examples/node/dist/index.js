"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("@visheratin/web-ai/text");
const common_1 = require("@visheratin/web-ai/common");
const web_ai_node_1 = require("@visheratin/web-ai-node");
const test = async () => {
    common_1.SessionParams.wasmRoot = "../node_modules/onnxruntime-node/dist/";
    common_1.SessionParams.executionProviders = ["cpu"];
    const modelResult = await text_1.TextModel.create("mini-lm-v2-quant", web_ai_node_1.createSession, web_ai_node_1.loadTokenizer, false);
    const model = modelResult.model;
    const output = await model.process([
        "Embeddings are the AI-native way to represent any kind of data, making them the perfect fit for working with all kinds of AI-powered tools and algorithms. They can represent text, images, and soon audio and video. There are many options for creating embeddings, whether locally using an installed library, or by calling an API.",
        "Chroma provides lightweight wrappers around popular embedding providers, making it easy to use them in your apps. You can set an embedding function when you create a Chroma collection, which will be used automatically, or you can call them directly yourself.",
    ]);
    console.log(`${output.tokensNum} tokens were processed in ${output.elapsed} seconds.`);
    console.log(output.result);
};
test();
//# sourceMappingURL=index.js.map