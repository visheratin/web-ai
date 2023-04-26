import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import classificationImg from "../public/index/classification.jpg";
import segmentationImg from "../public/index/segmentation.jpg";
import superresImg from "../public/index/super-resolution.jpg";
import detectionImg from "../public/index/detection.jpg";
import grammarImg from "../public/index/grammar.png";
import summaryImg from "../public/index/lorem.jpg";
import textVectorImg from "../public/index/vector.jpg";
import imageVectorImg from "../public/index/image-vector.png";
import zeroShotImg from "../public/index/zero-shot.jpg";
import samImg from "../public/index/sam.jpg";
import captionImg from "../public/index/blip.jpg";

export default function Home() {
  return (
    <>
      <Head>
        <title>Web AI Next.js example</title>
        <meta name="description" content="Web AI Next.js example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div className="container">
          <div className="row mb-2">
            <h2>About</h2>
            <p>
              Web AI is a TypeScript library that allows you to run modern deep learning models directly in your web
              browser. You can easily add AI capabilities to your web applications without the need for complex
              server-side infrastructure.
            </p>
            <p>
              The code is available on{" "}
              <a href="https://github.com/visheratin/web-ai" target="_blank" rel="noreferrer">
                GitHub
              </a>
              . The library can be installed from{" "}
              <a href="https://www.npmjs.com/package/@visheratin/web-ai" target="_blank" rel="noreferrer">
                NPM
              </a>
              .
            </p>
            <h4>Features</h4>
            <dl className="row">
              <dt className="col-sm-3">Easy to use</dt>
              <dd className="col-sm-9">Create a model with one line of code, get the result with another one.</dd>
              <dt className="col-sm-3">Powered by ONNX runtime</dt>
              <dd className="col-sm-9">
                Web AI runs the models using ONNX runtime for Web, which has rich support for of all kinds of operators.
                It means that any model will work just fine.
              </dd>
              <dt className="col-sm-3">Compatible with Hugging Face</dt>
              <dd className="col-sm-9">
                Web AI utilizes model configuration files in the same format as the hub, which makes it even easier to
                integrate existing models.
              </dd>
              <dt className="col-sm-3">Built-in caching</dt>
              <dd className="col-sm-9">
                Web AI stores the downloaded models in IndexedDB using localforage. You can configure the size of the
                cache dynamically.
              </dd>
              <dt className="col-sm-3">Web worker support</dt>
              <dd className="col-sm-9">
                All heavy operations - model creation and inference - are offloaded to a separate thread so the UI does
                not freeze.
              </dd>
            </dl>
          </div>
          <div className="row mb-2">
            <div className="col">
              <h2>Image models</h2>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Classification</h5>
                  <Image alt="" src={classificationImg} height={200} />
                  <p className="card-text">
                    Determine the primary class in the image. Is it more a dog, a cat, or a banjo?
                  </p>
                  <Link href="/demos/image-classification">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Segmentation</h5>
                  <Image alt="" src={segmentationImg} height={200} />
                  <p className="card-text">Find exact contours of objects. What is the castle and what is the tree?</p>
                  <Link href="/demos/segmentation">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Object detection</h5>
                  <Image alt="" src={detectionImg} height={200} />
                  <p className="card-text">Find bounding boxes of objects. Where are the happy people here?</p>
                  <Link href="/demos/object-detection">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Feature extraction</h5>
                  <Image alt="" src={imageVectorImg} height={200} />
                  <p className="card-text">Turn the images into vectors for sematic search.</p>
                  <Link href="/demos/image-features">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Super-resolution</h5>
                  <Image alt="" src={superresImg} height={200} />
                  <p className="card-text">Increase images resolution and improve their quality.</p>
                  <Link href="/demos/super-resolution">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Segment Anything</h5>
                  <Image alt="" src={samImg} height={200} />
                  <p className="card-text">Find anything on any image from any domain!</p>
                  <Link href="/demos/segment-anything">Open demo</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-2">
            <h2>Text models</h2>
          </div>
          <div className="row">
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Grammar correction</h5>
                  <Image alt="" src={grammarImg} height={200} />
                  <p className="card-text">Fix grammar errors in the text.</p>
                  <Link href="/demos/grammar-correction">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Summarization</h5>
                  <Image alt="" src={summaryImg} height={200} />
                  <p className="card-text">Find the most important ideas in the text.</p>
                  <Link href="/demos/summarization">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Feature extraction</h5>
                  <Image alt="" src={textVectorImg} height={200} />
                  <p className="card-text">Turn the text into vectors for sematic search.</p>
                  <Link href="/demos/text-features">Open demo</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-2">
            <h2>Multi-modal models</h2>
          </div>
          <div className="row">
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Zero-shot image classification</h5>
                  <Image alt="" src={zeroShotImg} height={200} />
                  <p className="card-text">What is the image class? You decide!</p>
                  <Link href="/demos/zero-shot">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Image captioning</h5>
                  <Image alt="" src={captionImg} height={200} />
                  <p className="card-text">Let the model describe your pictures.</p>
                  <Link href="/demos/image-caption">Open demo</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
