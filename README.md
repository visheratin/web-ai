# Web AI

Web AI is a TypeScript library that allows you to run modern deep learning models directly in your web browser. You can easily add AI capabilities to your web applications without the need for complex server-side infrastructure.

Features:

- Easy to use. Create a model with one line of code, get the result with another one.
- Powered by [ONNX runtime](https://onnxruntime.ai/). Web AI runs the models using ONNX runtime for Web, which has rich support for of all kinds of operators. It means that any model will work just fine.
- Compatible with [Hugging Face hub](https://huggingface.co/models). Web AI utilizes model configuration files in the same format as the hub, which makes it even easier to integrate existing models.
- Built-in caching. Web AI stores the downloaded models in IndexedDB using [localforage](https://github.com/localForage/localForage). You can configure the size of the cache dynamically.
- Web worker support. All heavy operations - model creation and inference - are offloaded to a separate thread so the UI does not freeze.

## Status

The library is under active development. If something does not work correctly, please file an issue on GitHub. Contributions are very welcome.

## Sponsors

- Continuing work on this project is sponsored by [Reflect](https://reflect.app/home) - awesome app for taking notes.
- Thanks to AlgoveraAI for the grant under their AI project financing [program](https://docs.algovera.ai/docs/Handbook/Grants/Introduction).

## Model types

### Text models

- Sequence-to-sequence (`TextModelType.Seq2Seq`). These models are used to transform the text into another text. Examples of such transformations are translation, summarization, and grammar correction.
- Feature extraction (`TextModelType.FeatureExtraction`). These models are used to transform the text into an array of numbers - embedding. Generated vectors are useful for semantic search or cluster analysis because embeddings of semantically similar text are similar and can be compared using [cosine similarity](https://en.wikipedia.org/wiki/Cosine_similarity).

### Image models

- Semantic segmentation (`ImageModelType.Segmentation`). These models cluster images into parts which belong to the same object class. In other words, segmentation models detect the exact shape of the objects in the image and classify them. An example of object detection is below:

  ![Semantic segmentation example](/images/segment.jpg)

- Object detection (`ImageModelType.ObjectDetection`). These models find objects in the images, classify them, and generate bounding boxes for the objects. The example of the object detection is below.

  ![Object detection example](/images/detection.jpg)

- Classification (`ImageModelType.Classification`). These models do not find exact objects in the images but they only determine what type of object is the most likely in the image. Because of that, this type of model is the most useful when there is only one distinct class of objects present in the image. In the example below, the image is classified as "Egyptian cat".

  ![Object detection example](/images/classification.jpg)

- Image-to-image (`ImageModelType.Img2Img`). These models produce images from other images. There are many [use cases](https://huggingface.co/tasks/image-to-image) for this kind of models. In the example below, you can see example of super-resolution (resizing the image from 256x256 to 1024x1024) with image restoring.

  ![Image-to-image example](/images/img2img.jpg)

## Installation

The library can be installed via `npm`:

```
npm install @visheratin/web-ai
```

If you plan to use image models, you also need to install `jimp`:

```
npm install jimp
```

## Create model instance

### Create model from ID

The first way of creating a model is using the model identifier. This method works only for the built-in models.

For text models:

```TypeScript
import { TextModel } from "@visheratin/web-ai";

const result = await TextModel.create("grammar-t5-efficient-tiny")
console.log(result.elapsed)
const model = result.model
```

For image models:

```TypeScript
import { ImageModel } from "@visheratin/web-ai";

const result = await ImageModel.create("yolos-tiny-quant")
console.log(result.elapsed)
const model = result.model
```

### Create model from metadata

The second way to create a model is via the model metadata. This method allows the use of custom ONNX models. In this case, we need
to use a specific model class. Please note that when creating the model from the metadata, you need to call an `init()` method before using the model. This is needed to create inference sessions, download configuration files, and create internal structures.

#### Text models

The metadata for text models is defined by the `TextMetadata` class. Not all fields are required for the model creation. The minimal example for the `Seq2Seq` model is:

```TypeScript
import { Seq2SeqModel, TextMetadata } from "@visheratin/web-ai";

const metadata: TextMetadata = {
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://huggingface.co/visheratin/t5-efficient-tiny-grammar-correction/resolve/main/encoder_model.onnx",
      ],
      [
        "decoder",
        "https://huggingface.co/visheratin/t5-efficient-tiny-grammar-correction/resolve/main/decoder_with_past_model.onnx",
      ],
    ]),
    tokenizerPath: "https://huggingface.co/visheratin/t5-efficient-tiny-grammar-correction/resolve/main/tokenizer.json",
  }

const model = new Seq2SeqModel(metadata);
const elapsed = await model.init();
console.log(elapsed);
```

The minimal example for the `FeatureExtraction` model is:

```TypeScript
import { FeatureExtractionModel, TextMetadata } from "@visheratin/web-ai";

const metadata: TextMetadata = {
    modelPaths: new Map<string, string>([
      [
        "encoder",
        "https://huggingface.co/visheratin/t5-efficient-tiny-grammar-correction/resolve/main/encoder_model.onnx",
      ],
    ]),
    tokenizerPath: "https://huggingface.co/visheratin/t5-efficient-tiny-grammar-correction/resolve/main/tokenizer.json",
  }

const model = new FeatureExtractionModel(metadata);
const elapsed = await model.init();
console.log(elapsed);
```

#### Image models

The metadata for image models is defined by the `ImageMetadata` class. Not all fields are required for the model creation. The minimal example for all image models is:

```TypeScript
import { ImageMetadata } from "@visheratin/web-ai";

const metadata: ImageMetadata = {
    modelPath: "https://huggingface.co/visheratin/segformer-b0-finetuned-ade-512-512/resolve/main/b0.onnx.gz",
    configPath: "https://huggingface.co/visheratin/segformer-b0-finetuned-ade-512-512/resolve/main/config.json",
    preprocessorPath: "https://huggingface.co/visheratin/segformer-b0-finetuned-ade-512-512/resolve/main/preprocessor_config.json",
  }
```

Then, the model can be created:

```TypeScript
import { ClassificationModel, ObjectDetectionModel, SegmentationModel } from "@visheratin/web-ai";

const model = new ClassificationModel(metadata);
// or
const model = new ObjectDetectionModel(metadata);
// or
const model = new SegmentationModel(metadata);

const elapsed = await model.init();
console.log(elapsed);
```

### Additional parameters

You can configure cache size and execution mode for the model using the following parameters:

1. `cache_size_mb` - cache size, in megabytes. Default value is `500`.
2. `proxy` - flag specifying whether to offload the model to the web worker. Default value is `true`.

These parameters are available in `create()` and `init()` methods.

## Data processing

### Text models

The processing is done using a `process()` method.

`Seq2Seq` models output text:

```TypeScript
const input = "Test text input"
const output = await model.process(input)
console.log(output.text)
console.log(`Sentence of length ${input.length} (${output.tokensNum} tokens) was processed in ${output.elapsed} seconds`)
```

`Seq2Seq` models also support output streaming via `processStream()` method:

```TypeScript
const input = "Test text input"
let output = "";
for await (const piece of model.processStream(value)) {
  output = output.concat(piece);
}
console.log(output)
```

If a `Seq2Seq` model supports task-specific prefixes (e.g., `summarize` or `translate`), you can use them
to specify what kind of processing is needed:

```TypeScript
const input = "Test text input"
const output = await model.process(input, "summarize")
console.log(output.text)
console.log(`Sentence of length ${input.length} (${output.tokensNum} tokens) was processed in ${output.elapsed} seconds`)
```

If the model does not allow the specified prefix, the error will be thrown.

`FeatureExtraction` models output numeric array:

```TypeScript
const input = "Test text input"
const output = await model.process(input)
console.log(output.result)
console.log(`Sentence of length ${input.length} (${output.tokensNum} tokens) was processed in ${output.elapsed} seconds`)
```

### Image models

For the image models, the processing is also done using a `process()` method.

`Segmentation` models output HTML canvas, which can be overlayed on the original image:

```TypeScript
const input = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Georgia5and120loop.jpg/640px-Georgia5and120loop.jpg"
const output = await model.process(input)
var destCtx = canvas.getContext("2d");
destCtx.globalAlpha = 0.4;
destCtx.drawImage(result.canvas, 0, 0, result.canvas.width, result.canvas.height,
  0, 0, canvas.width, canvas.height);
console.log(output.elapsed)
```

If you want to determine the class from the output canvas, you can use the `getClass()` method:

```TypeScript
// xCoord and yCoord are coordinates of the target pixel on the canvas
const rect = canvas.getBoundingClientRect();
const ctx = canvas.getContext("2d");
const x = xCoord - rect.left;
const y = yCoord - rect.top;
const c = ctx!.getImageData(x, y, 1, 1).data;
const className = model.instance.getClass(c);
console.log(className);
```

`Object detection` models output a list of bounding box predictions along with their classes and colors. Bounding boxes can be used to draw them over the original image:

```TypeScript
const input = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Georgia5and120loop.jpg/640px-Georgia5and120loop.jpg"
const output = await model.process(input)
for (let object of output.objects) {
  var rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttributeNS(null, "x", (sizes[0] * object.x).toString());
  rect.setAttributeNS(null, "y", (sizes[1] * object.y).toString());
  rect.setAttributeNS(null, "width", (sizes[0] * object.width).toString());
  rect.setAttributeNS(
    null,
    "height",
    (sizes[1] * object.height).toString()
  );
  const color = object.color;
  rect.setAttributeNS(null, "fill", color);
  rect.setAttributeNS(null, "stroke", color);
  rect.setAttributeNS(null, "stroke-width", "2");
  rect.setAttributeNS(null, "fill-opacity", "0.35");
  // svgRoot is a root SVG element on the page
  svgRoot.appendChild(rect);
}
```

`Classification` models output an array of predicted classes along with the confidence scores in range [0,1] sorted by confidence in the descending order. When running the `process()` method, you can specify the number of returned predictions (default is 3):

```TypeScript
const input = "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Georgia5and120loop.jpg/640px-Georgia5and120loop.jpg"
const output = await model.process(input, 5)
for (let item of output.results) {
  console.log(item.class, item.confidence)
}
```

## Built-in models

### Text models

#### Grammar correction

- `grammar-t5-efficient-mini` - larger model for grammar correction (197 MB). Works the best overall.
- `grammar-t5-efficient-mini-quant` - minified (quantized) version of the `grammar-t5-efficient-mini` model. Quantization makes the performance slightly worse but the size is 5 times smaller than the original one.
- `grammar-t5-efficient-tiny` - small model for grammar correction (113 MB). Works a bit worse than the larger model but is almost twice smaller.
- `grammar-t5-efficient-tiny-quant` - minified (quantized) version of the `grammar-t5-efficient-tiny` model. Quantization makes the performance slightly worse but the size is 4 times smaller than the original one. It is the smallest model, only 24 MB in total.

#### Summarization

- `summarization-cnn-dailymail` - a model for summarization that was trained on CNN and Daily Mail news articles.
- `summarization-cnn-dailymail-quant` - minified (quantized) version of the `summarization-t5` model. Quantization makes the performance slightly worse but the size is 5 times smaller than the original one - 63 MB.

#### Feature extraction

- `t5-efficient-mini` - larger model for feature extraction (94 MB). Works the best overall.
- `t5-efficient-mini-quant` - minified (quantized) version of the `t5-efficient-mini` model. Quantization makes the performance slightly worse but the size is almost 3 times smaller than the original one - 38 MB.

### Image models

#### Semantic segmentation

- `segformer-b0-segmentation-quant` - the smallest model for indoor and outdoor scenes (3 MB). Provides a decent quality but the object borders are not always correct.
- `segformer-b1-segmentation-quant` - larger model for indoor and outdoor scenes (9 MB). Provides good quality and better object borders.
- `segformer-b4-segmentation-quant` - the largest model for indoor and outdoor scenes (41 MB). Provides the best quality.

#### Classification

- `mobilevit-small` - small model (19 MB) for classification of a large range of classes - people, animals, indoor and outdoor objects.
- `mobilevit-xsmall` - even smaller model (8 MB) for classification of a large range of classes - people, animals, indoor and outdoor objects.
- `mobilevit-xxsmall` - the smallest model (5 MB) for classification of a large range of classes - people, animals, indoor and outdoor objects.
- `segformer-b2-classification` - larger model for indoor and outdoor scenes (88 MB).
- `segformer-b2-classification-quant` - minified (quantized) version of the `segformer-b2-classification` model (17 MB). Provides comparable results with the original.
- `segformer-b1-classification` - smaller model for indoor and outdoor scenes (48 MB).
- `segformer-b1-classification-quant` - minified (quantized) version of the `segformer-b1-classification` model (9 MB). Provides comparable results with the original.
- `segformer-b0-classification` - the smallest model for indoor and outdoor scenes (13 MB).
- `segformer-b0-classification-quant` - minified (quantized) version of the `segformer-b0-classification` model (3 MB). Provides comparable results with the original.

#### Object detection

- `yolos-tiny` - small (23 MB) but powerful model for finding a large range of classes - people, animals, indoor and outdoor objects.
- `yolos-tiny-quant` - minified (quantized) version of the `yolos-tiny` model. The borders are slightly off compared to the original but the size is 3 times smaller (7 MB).

#### Image-to-image

- `superres-standard` - the model for 2x super-resolution (43 MB). Be aware that the image generation with this model is quite slow - 50+ seconds, depending on hardware and image size.
- `superres-standard-quant` - minified (quantized) version of the `superres-standard` model (10 MB).
- `superres-small` - tiny model for 2x super-resolution (4 MB). The model runs much faster than the `superres-standard` - 10+ seconds, depending on hardware and image size.
- `superres-small-quant` - minified (quantized) version of the `superres-small` model (1.5 MB).
- `superres-standard-x4` - the model for 4x super-resolution (43 MB). Be aware that the image generation with this model is quite slow - 50+ seconds, depending on hardware and image size.
- `superres-standard-x4-quant` - minified (quantized) version of the `superres-standard-x4` model (10 MB).
- `superres-compressed-x4` - the model for 4x super-resolution of compressed images (43 MB). The model not only increases the image resolution, but also improves its quality. Be aware that the image generation with this model is quite slow - 50+ seconds, depending on hardware and image size.
- `superres-compressed-x4-quant` - minified (quantized) version of the `superres-compressed-x4` model (10 MB).

## Future development

- Add examples for popular web frameworks.
- Improve grammar correction model.
- Extend text models beyond T5.
- Distil [Flan-T5-small](https://huggingface.co/google/flan-t5-small) model to make it more usable in the browser.
- Add audio models ([Whisper-small](https://huggingface.co/openai/whisper-small)).
