import Jimp from "jimp";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { ImageModel, SegmentationModel, ImageModelType } from "@visheratin/web-ai";
import ModelSelector from "../../components/modelSelect";

export default function Segmentation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileSelectRef = useRef<HTMLInputElement>(null);

  const [displayDims, setDisplayDims] = useState({
    width: 0,
    height: 0,
    aspectRatio: 1,
  });

  const setCanvasSize = (aspectRatio = 1) => {
    if (canvasRef.current && canvasContainerRef.current) {
      let canvasSize = canvasContainerRef.current.offsetWidth - 11;
      canvasSize = canvasSize > 800 ? 800 : canvasSize;
      setDisplayDims({
        width: canvasSize,
        height: canvasSize * aspectRatio,
        aspectRatio: aspectRatio,
      });
    }
  };

  const [className, setClassName] = useState({ value: "none" });

  useEffect(() => {
    setCanvasSize();
  }, []);

  const [model, setModel] = useState(
    new SegmentationModel({
      id: "segformer-b0-segmentation-quant",
      type: ImageModelType.Segmentation,
      modelPath: "",
      configPath: "",
      preprocessorPath: "",
      memEstimateMB: 0,
    }),
  );

  const [status, setStatus] = useState({ message: "ready", processing: false });

  const loadModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await ImageModel.create(id);
    setModel(result.model as SegmentationModel);
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

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas!.getContext("2d");
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
  };

  const getClass = (e: any) => {
    const canvas = canvasRef.current;
    const rect = canvas!.getBoundingClientRect();
    const ctx = canvas!.getContext("2d");
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = ctx!.getImageData(x, y, 1, 1).data;
    const className = model.getClass(c);
    setClassName({ value: className });
  };

  /**
   * loadImage reads the image data from the source, displays it on the canvas,
   * and sets the image data to the respective state.
   * @param src can be either URL or array buffer
   */
  const loadImage = async (src: any) => {
    setStatus({ processing: true, message: "processing the image" });
    const imageBuffer = await Jimp.read(src);
    setCanvasSize(imageBuffer.bitmap.height / imageBuffer.bitmap.width);
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
    imageRef.current!.src = c.toDataURL("image/png");
    clearCanvas();
    const result = await model.process(src);
    console.log(`Inference finished in ${result.elapsed} seconds.`);
    const canvas = canvasRef.current;
    const destCtx = canvas!.getContext("2d");
    destCtx!.globalAlpha = 0.4;
    destCtx!.drawImage(
      result.canvas,
      0,
      0,
      result.canvas.width,
      result.canvas.height,
      0,
      0,
      canvas!.width,
      canvas!.height,
    );
    setStatus({ processing: false, message: "ready" });
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
            imageType={ImageModelType.Segmentation}
            callback={loadModel}
          />
          <div className="row">
            <div className="col-md-6 col-sm-12">
              <div ref={canvasContainerRef} style={{ position: "relative", height: displayDims.height }}>
                <img
                  ref={imageRef}
                  width={displayDims.width}
                  height={displayDims.height}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
                <canvas
                  ref={canvasRef}
                  width={displayDims.width}
                  height={displayDims.height}
                  style={{ position: "absolute", top: 0, left: 0 }}
                  onClick={getClass}
                  onTouchEnd={getClass}
                />
              </div>
              <h6 className="center-align">Selected class: {className.value}</h6>
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
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
