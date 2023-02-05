import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import classificationImg from "../public/index/classification.jpg";
import segmentationImg from "../public/index/segmentation.jpg";
import superresImg from "../public/index/super-resolution.jpg";
import detectionImg from "../public/index/detection.jpg";
import grammarImg from "../public/index/grammar.png";
import summaryImg from "../public/index/lorem.jpg";
import vectorImg from "../public/index/vector.jpg";

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
            <div className="col">
              <h2>Image models</h2>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-md-4 col-sm-12 mb-2">
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
            <div className="col-md-4 col-sm-12 mb-2">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Segmentation</h5>
                  <Image alt="" src={segmentationImg} height={200} />
                  <p className="card-text">Find exact contours of objects. What is the castle and what is the tree?</p>
                  <Link href="/demos/segmentation">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-2">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Super-resolution</h5>
                  <Image alt="" src={superresImg} height={200} />
                  <p className="card-text">Increase images resolution and improve their quality.</p>
                  <Link href="/demos/super-resolution">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-2">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Object detection</h5>
                  <Image alt="" src={detectionImg} height={200} />
                  <p className="card-text">Find bounding boxes of objects. Where are the happy people here?</p>
                  <Link href="/demos/object-detection">Open demo</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="row mb-2 mt-5">
            <h2>Text models</h2>
          </div>
          <div className="row">
            <div className="col-md-4 col-sm-12 mb-2">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Grammar correction</h5>
                  <Image alt="" src={grammarImg} height={200} />
                  <p className="card-text">Fix grammar errors in the text.</p>
                  <Link href="/demos/grammar-correction">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-2">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Summarization</h5>
                  <Image alt="" src={summaryImg} height={200} />
                  <p className="card-text">Fix grammar errors in the text.</p>
                  <Link href="/demos/summarization">Open demo</Link>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-sm-12 mb-2">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Features extraction</h5>
                  <Image alt="" src={vectorImg} height={200} />
                  <p className="card-text">Fix grammar errors in the text.</p>
                  <Link href="/demos/text-features">Open demo</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
