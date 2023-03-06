import Head from "next/head";
import Jimp from "jimp";
import { useEffect, useRef, useState } from "react";
import { ImageModel, ImageModelType, ObjectDetectionModel, ObjectDetectionPrediction } from "@visheratin/web-ai";
import ModelSelector from "../../components/modelSelect";

export default function Classification() {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const fileSelectRef = useRef<HTMLInputElement>(null);

  // create state store for canvas size properties
  const [displayDims, setDisplayDims] = useState({
    width: 0,
    height: 0,
    aspectRatio: 1,
  });

  const setImageSize = (aspectRatio = 1): number[] => {
    if (imageContainerRef.current) {
      let canvasSize = imageContainerRef.current.offsetWidth - 11;
      canvasSize = canvasSize > 800 ? 800 : canvasSize;
      const width = canvasSize;
      const height = canvasSize * aspectRatio;
      setDisplayDims({
        width: width,
        height: height,
        aspectRatio: aspectRatio,
      });
      return [width, height];
    }
    return [];
  };

  useEffect(() => {
    setImageSize();
  }, []);

  const [predictions, setPredictions] = useState({
    results: [] as ObjectDetectionPrediction[],
  });

  const [model, setModel] = useState({});

  const loadModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await ImageModel.create(id);
    setModel({ instance: result.model as ObjectDetectionModel });
    setStatus({ message: "ready", processing: false });
  };

  const [status, setStatus] = useState({ message: "ready", processing: false });

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

  /**
   * loadImage reads the image data from the source, displays it on the canvas,
   * and sets the image data to the respective state.
   * @param src can be either URL or array buffer
   */
  const loadImage = async (src: any) => {
    setStatus({ message: "processing the image", processing: true });
    while (svgRef.current!.firstChild) {
      svgRef.current!.removeChild(svgRef.current!.firstChild);
    }
    const imageBuffer = await Jimp.read(src);
    const sizes = setImageSize(imageBuffer.bitmap.height / imageBuffer.bitmap.width);
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
    // @ts-ignore
    const result = await model.instance.process(src);
    console.log(`Inference finished in ${result.elapsed} seconds.`);
    for (const object of result.objects) {
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttributeNS(null, "x", (sizes[0] * object.x).toString());
      rect.setAttributeNS(null, "y", (sizes[1] * object.y).toString());
      rect.setAttributeNS(null, "width", (sizes[0] * object.width).toString());
      rect.setAttributeNS(null, "height", (sizes[1] * object.height).toString());
      const color = object.color;
      rect.setAttributeNS(null, "fill", color);
      rect.setAttributeNS(null, "stroke", color);
      rect.setAttributeNS(null, "stroke-width", "2");
      rect.setAttributeNS(null, "fill-opacity", "0.35");
      svgRef.current?.appendChild(rect);
    }
    setPredictions({ results: result.objects });
    setStatus({ message: "finished processing", processing: false });
  };

  return (
    <>
      <Head>
        <title>Web AI Next.js object detection example</title>
        <meta name="description" content="Web AI Next.js object detection example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className="container">
          <div className="row">
            <div className="col">
              <h2>Object detection</h2>
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
            imageType={ImageModelType.ObjectDetection}
            callback={loadModel}
          />
          <div className="row">
            <div className="col-md-6 col-sm-12">
              <div ref={imageContainerRef} style={{ position: "relative", height: displayDims.height }}>
                <img
                  ref={imageRef}
                  width={displayDims.width}
                  height={displayDims.height}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
                <svg
                  ref={svgRef}
                  width={displayDims.width}
                  height={displayDims.height}
                  style={{ position: "absolute", top: 0, left: 0 }}
                ></svg>
              </div>
              {predictions.results && predictions.results.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Color</th>
                      <th>Class</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.results.map((item, _) => {
                      return (
                        <tr key={item.class}>
                          <td style={{ backgroundColor: item.color }}></td>
                          <td>{item.class}</td>
                          <td>{Math.round(item.confidence * 10000) / 10000}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
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
