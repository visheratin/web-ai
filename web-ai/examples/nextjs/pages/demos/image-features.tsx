import Jimp from "jimp";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { createSession } from "@visheratin/web-ai-browser";
import { ImageModel, ImageFeatureExtractionModel, ImageModelType } from "@visheratin/web-ai/image";
import ModelSelector from "../../components/modelSelect";

export default function ImageFeatures() {
  const imageContainer1Ref = useRef<HTMLDivElement>(null);
  const image1Ref = useRef<HTMLImageElement>(null);
  const fileSelect1Ref = useRef<HTMLInputElement>(null);
  const imageContainer2Ref = useRef<HTMLDivElement>(null);
  const image2Ref = useRef<HTMLImageElement>(null);
  const fileSelect2Ref = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState({ value: 0.0, className: "" });

  const [imageData1, setImageData1] = useState(new ArrayBuffer(0));
  const [imageData2, setImageData2] = useState(new ArrayBuffer(0));

  const [displayDims1, setDisplayDims1] = useState({
    width: 0,
    height: 0,
    aspectRatio: 1,
  });

  const [displayDims2, setDisplayDims2] = useState({
    width: 0,
    height: 0,
    aspectRatio: 1,
  });

  const setImageSize = (first: boolean, aspectRatio = 1) => {
    if (first) {
      if (imageContainer1Ref.current) {
        let canvasSize = imageContainer1Ref.current.offsetWidth - 11;
        canvasSize = canvasSize > 800 ? 800 : canvasSize;
        setDisplayDims1({
          width: canvasSize,
          height: canvasSize * aspectRatio,
          aspectRatio: aspectRatio,
        });
      }
    } else {
      if (imageContainer2Ref.current) {
        let canvasSize = imageContainer2Ref.current.offsetWidth - 11;
        canvasSize = canvasSize > 800 ? 800 : canvasSize;
        setDisplayDims2({
          width: canvasSize,
          height: canvasSize * aspectRatio,
          aspectRatio: aspectRatio,
        });
      }
    }
  };

  useEffect(() => {
    setImageSize(true);
    setImageSize(false);
  }, []);

  const [model, setModel] = useState({});

  const [status, setStatus] = useState({ message: "select and load the model", processing: false });

  const loadModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await ImageModel.create(id, createSession);
    setModel({ instance: result.model as ImageFeatureExtractionModel });
    setStatus({ message: "ready", processing: false });
  };

  /**
   * selectFileImage sets the image data from the file select field
   */
  const selectFileImage = (first: boolean) => {
    if (first) {
      if (fileSelect1Ref.current && fileSelect1Ref.current.files && fileSelect1Ref.current.files[0]) {
        const reader = new FileReader();
        reader.onload = async () => {
          const data = reader.result as ArrayBuffer;
          setImageData1(data);
          loadImage(first, data);
        };
        reader.readAsArrayBuffer(fileSelect1Ref.current.files[0]);
      }
    } else {
      if (fileSelect2Ref.current && fileSelect2Ref.current.files && fileSelect2Ref.current.files[0]) {
        const reader = new FileReader();
        reader.onload = async () => {
          const data = reader.result as ArrayBuffer;
          setImageData2(data);
          loadImage(first, data);
        };
        reader.readAsArrayBuffer(fileSelect2Ref.current.files[0]);
      }
    }
  };

  /**
   * loadImage reads the image data from the source, displays it on the canvas,
   * and sets the image data to the respective state.
   * @param src can be either URL or array buffer
   */
  const loadImage = async (first: boolean, src: any) => {
    const imageBuffer = await Jimp.read(src);
    setImageSize(first, imageBuffer.bitmap.height / imageBuffer.bitmap.width);
    const imageData = new ImageData(
      new Uint8ClampedArray(imageBuffer.bitmap.data),
      imageBuffer.bitmap.width,
      imageBuffer.bitmap.height,
    );
    const c = document.createElement("canvas");
    c.width = imageBuffer.bitmap.width;
    c.height = imageBuffer.bitmap.height;
    const ctx = c.getContext("2d");
    ctx!.putImageData(imageData, 0, 0);
    if (first) {
      image1Ref.current!.src = c.toDataURL("image/png");
    } else {
      image2Ref.current!.src = c.toDataURL("image/png");
    }
  };

  const process = async () => {
    if (!imageData1 || imageData1.byteLength == 0 || !imageData2 || imageData2.byteLength == 0 || !model) {
      return;
    }
    setStatus({ message: "processing", processing: true });
    // @ts-ignore
    const output = await model.instance.process([imageData1, imageData2]);
    const sim = cosineSim(output.result[0], output.result[1]);
    const result = Math.round((sim + Number.EPSILON) * 100) / 100;
    let className = "bg-info";
    if (result > 0.75) {
      className = "bg-success";
    }
    if (result < 0.25) {
      className = "bg-danger";
    }
    setResult({ value: result, className: className });
    setStatus({ processing: false, message: "finished processing" });
  };

  const cosineSim = (vector1: number[], vector2: number[]) => {
    let dotproduct = 0;
    let m1 = 0;
    let m2 = 0;
    for (let i = 0; i < vector1.length; i++) {
      dotproduct += vector1[i] * vector2[i];
      m1 += vector1[i] * vector1[i];
      m2 += vector2[i] * vector2[i];
    }
    m1 = Math.sqrt(m1);
    m2 = Math.sqrt(m2);
    const sim = dotproduct / (m1 * m2);
    return sim;
  };

  return (
    <>
      <Head>
        <title>Web AI Next.js image feature extraction example</title>
        <meta name="description" content="Web AI Next.js classification example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className="container">
          <div className="row">
            <div className="col">
              <h2>Image feature extraction</h2>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="d-flex align-items-center">
                <strong>Status: {status.message}</strong>
              </div>
            </div>
          </div>
          <ModelSelector
            tags={undefined}
            textType={undefined}
            imageType={ImageModelType.FeatureExtraction}
            multimodalType={undefined}
            callback={loadModel}
          />
          <div className="row">
            <div className="col-md-6 col-sm-12 mb-2">
              <div className="row">
                <div className="col-sm-12 mb-2">
                  <div ref={imageContainer1Ref} style={{ position: "relative", height: displayDims1.height }}>
                    <img
                      alt=""
                      ref={image1Ref}
                      width={displayDims1.width}
                      height={displayDims1.height}
                      style={{ position: "absolute", top: 0, left: 0 }}
                    />
                  </div>
                </div>
                <div className="col-sm-12 mb-2">
                  <form action="#" onSubmit={(e) => e.preventDefault()}>
                    <h6>Select the first image</h6>
                    <div className="row">
                      <div className="mb-3">
                        <input
                          className="form-control"
                          type="file"
                          ref={fileSelect1Ref}
                          onChange={() => selectFileImage(true)}
                          disabled={status.processing}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-12 mb-2">
              <div className="row">
                <div className="col-sm-12 mb-2">
                  <div ref={imageContainer2Ref} style={{ position: "relative", height: displayDims2.height }}>
                    <img
                      alt=""
                      ref={image2Ref}
                      width={displayDims2.width}
                      height={displayDims2.height}
                      style={{ position: "absolute", top: 0, left: 0 }}
                    />
                  </div>
                </div>
                <div className="col-sm-12 mb-2">
                  <form action="#" onSubmit={(e) => e.preventDefault()}>
                    <h6>Select the second image</h6>
                    <div className="row">
                      <div className="mb-3">
                        <input
                          className="form-control"
                          type="file"
                          ref={fileSelect2Ref}
                          onChange={() => selectFileImage(false)}
                          disabled={status.processing}
                        />
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-sm-3"></div>
              <div className="col-sm-6">
                <div className="d-grid gap-2">
                  <button className="btn btn-lg btn-primary" disabled={!model || status.processing} onClick={process}>
                    Process
                  </button>
                </div>
              </div>
            </div>
            <div className="row mb-2 mt-4">
              <div className="col-sm-3"></div>
              <div className="col-sm-6">
                <div className="progress" role="progressbar">
                  <div className={result.className} style={{ width: `${((result.value + 1) / 2) * 100}%` }}></div>
                </div>
              </div>
              <div className="row mb-2">
                <div className="col-sm-3"></div>
                <div className="col-sm-6">
                  <p className="text-center">Simimarity score of the images is {result.value}.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
