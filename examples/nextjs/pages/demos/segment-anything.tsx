import Jimp from "jimp";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { ImageModel, ImageModelType, Point } from "@visheratin/web-ai";
import ModelSelector from "../../components/modelSelect";
import { SegmentAnythingModel, SessionParams } from "../../../../dist";
import { SegmentAnythingPrompt } from "../../../../dist/image";
import Canvas from "../../components/canvas";

export default function SegmentAnything() {
  const fileSelectRef = useRef<HTMLInputElement>(null);
  const [imageProcessed, setImageProcessed] = useState(false);
  const [image, setImage] = useState<Jimp | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<SegmentAnythingPrompt>({
    image: undefined,
    points: undefined,
    boxes: undefined,
  });
  const [segmentCanvas, setSegmentCanvas] = useState<HTMLCanvasElement>();

  const [model, setModel] = useState(
    new SegmentAnythingModel({
      id: "segformer-b0-segmentation-quant",
      type: ImageModelType.Segmentation,
      modelPaths: new Map<string, string>(),
      configPath: "",
      preprocessorPath: "",
      memEstimateMB: 0,
    }),
  );

  const [status, setStatus] = useState({ message: "select and load the model", processing: false });

  const loadModel = async (id: string) => {
    SessionParams.numThreads = 4;
    setStatus({ message: "loading the model", processing: true });
    const result = await ImageModel.create(id);
    setModel(result.model as SegmentAnythingModel);
    setStatus({ message: "ready", processing: false });
  };

  /**
   * selectFileImage sets the image data from the file select field
   */
  const selectFileImage = () => {
    if (fileSelectRef.current && fileSelectRef.current.files && fileSelectRef.current.files[0]) {
      const reader = new FileReader();
      reader.onload = async () => {
        loadImage(reader.result);
      };
      reader.readAsArrayBuffer(fileSelectRef.current.files[0]);
    }
  };

  const segment = async () => {
    if (image === null) {
      return;
    }
    setStatus({ processing: true, message: "processing the image" });
    const prompt = currentPrompt as SegmentAnythingPrompt;
    prompt.image = image;
    if (imageProcessed) {
      prompt.image = undefined;
    }
    const result = await model.process(prompt);
    if (result === undefined) {
      setStatus({ processing: false, message: "ready" });
      return;
    }
    setImageProcessed(true);
    console.log(`Inference finished in ${result.elapsed} seconds.`);
    setSegmentCanvas(result.canvas);
    setStatus({ processing: false, message: "ready" });
  };

  /**
   * loadImage reads the image data from the source, displays it on the canvas,
   * and sets the image data to the respective state.
   * @param src can be either URL or array buffer
   */
  const loadImage = async (src: any) => {
    const imageBuffer = await Jimp.read(src);
    setImage(imageBuffer);
  };

  return (
    <>
      <Head>
        <title>Web AI Next.js segmentation example</title>
        <meta name="description" content="Web AI Next.js segmentation example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className="container">
          <div className="row">
            <div className="col">
              <h2>Image segmentation</h2>
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
            imageType={ImageModelType.SegmentAnything}
            callback={loadModel}
          />
          <div className="row">
            <div className="col-md-6 col-sm-12">
              <Canvas
                image={image}
                setPrompt={setCurrentPrompt}
                processing={status.processing}
                segmentCanvas={segmentCanvas}
              />
            </div>
            <div className="col-md-6 col-sm-12">
              <form action="#" onSubmit={(e) => e.preventDefault()}>
                <h6>Select the image</h6>
                <div className="row">
                  <div className="mb-3">
                    <input
                      className="form-control"
                      type="file"
                      ref={fileSelectRef}
                      onChange={selectFileImage}
                      disabled={status.processing}
                    />
                  </div>
                </div>
              </form>
              <hr />
              <button className="btn btn-primary" onClick={segment} disabled={status.processing || image === null}>
                Segment
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
