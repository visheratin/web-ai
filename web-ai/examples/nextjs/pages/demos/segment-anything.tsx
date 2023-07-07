import Jimp from "jimp";
import Head from "next/head";
import { useRef, useState } from "react";
import { createSession } from "@visheratin/web-ai-browser";
import { ImageModel, ImageModelType, SegmentAnythingPrompt, SegmentAnythingModel } from "@visheratin/web-ai/image";
import ModelSelector from "../../components/modelSelect";
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

  const [samModel, setSamModel] = useState(
    new SegmentAnythingModel({
      id: "",
      type: ImageModelType.Segmentation,
      modelPaths: new Map<string, string>(),
      configPath: "",
      preprocessorPath: "",
      memEstimateMB: 0,
    }),
  );

  const [status, setStatus] = useState({ message: "select and load the model", processing: false });

  const loadSamModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await ImageModel.create(id, createSession);
    setSamModel(result.model as SegmentAnythingModel);
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
    // @ts-ignore
    prompt.image = image;
    if (imageProcessed) {
      prompt.image = undefined;
    }
    const result = await samModel.process(prompt);
    if (result === undefined) {
      setStatus({ processing: false, message: "ready" });
      return;
    }
    setImageProcessed(true);
    console.log(`Inference finished in ${result.elapsed} seconds.`);
    setSegmentCanvas(result.canvas as HTMLCanvasElement);
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
    setImageProcessed(false);
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
              <h2>Segment Anything demo</h2>
              <p>
                This demo shows how to use the{" "}
                <a href="https://segment-anything.com/" target="_blank" rel="noreferrer">
                  Segment Anything Model
                </a>{" "}
                from MetaAI to find objects on any image.
              </p>
              <p>Steps to use the demo:</p>
              <ol>
                <li>Select the model.</li>
                <li>Load the image.</li>
                <li>
                  Mark the object in the image. Mark with foreground points what you want to detect, with background
                  points - what you want to exclude from the mask. You can also mark the target object with a bounding
                  box.
                </li>
                <li>
                  Click the &quot;Segment&quot; button. The first time, the model will run for about 15-20 seconds.
                </li>
                <li>Repeat the process. After the first run, the model will run instantaneously.</li>
              </ol>
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
            callback={loadSamModel}
          />
          <hr />
          <div className="row">
            <div className="col-md-3 col-sm-12"></div>
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
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-md-2 col-sm-12"></div>
            <div className="col-md-8 col-sm-12">
              <Canvas
                image={image}
                setPrompt={setCurrentPrompt}
                processing={status.processing}
                segmentCanvas={segmentCanvas}
              />
            </div>
          </div>
          <div className="row mt-2">
            <div className="col-sm-12 d-flex justify-content-center">
              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={segment}
                hidden={image === null}
                disabled={status.processing || image === null}
                style={{ width: "300px" }}
              >
                Segment
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
