import Jimp from "jimp";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { ImageModel, ClassificationModel, ClassificationPrediction } from "@visheratin/web-ai";

export default function Classification() {
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileSelectRef = useRef<HTMLInputElement>(null);

  const [displayDims, setDisplayDims] = useState({
    width: 0,
    height: 0,
    aspectRatio: 1,
  });

  const setImageSize = (aspectRatio: number = 1) => {
    if (imageContainerRef.current) {
      let canvasSize = imageContainerRef.current.offsetWidth - 11;
      canvasSize = canvasSize > 800 ? 800 : canvasSize;
      setDisplayDims({
        width: canvasSize,
        height: canvasSize * aspectRatio,
        aspectRatio: aspectRatio,
      });
    }
  };

  useEffect(() => {
    setImageSize();
    loadModel();
  }, []);

  const [predictions, setPredictions] = useState({
    results: [] as ClassificationPrediction[],
  });

  const [model, setModel] = useState({});

  const [status, setStatus] = useState({ message: "ready", processing: false });

  const loadModel = async () => {
    setStatus({ message: "loading the model", processing: true });
    const result = await ImageModel.create("efficientformer-l1-classification-quant");
    setModel({ instance: result.model as ClassificationModel });
    setStatus({ message: "ready", processing: false });
  };

  /**
   * selectFileImage sets the image data from the file select field
   */
  const selectFileImage = () => {
    if (fileSelectRef.current && fileSelectRef.current.files && fileSelectRef.current.files[0]) {
      var reader = new FileReader();
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
    var imageBuffer = await Jimp.read(src);
    setImageSize(imageBuffer.bitmap.height / imageBuffer.bitmap.width);
    const imageData = new ImageData(
      new Uint8ClampedArray(imageBuffer.bitmap.data),
      imageBuffer.bitmap.width,
      imageBuffer.bitmap.height,
    );
    let c = document.createElement("canvas");
    c.width = imageBuffer.bitmap.width;
    c.height = imageBuffer.bitmap.height;
    const ctx = c.getContext("2d");
    ctx!.putImageData(imageData, 0, 0);
    imageRef.current!.src = c.toDataURL("image/png");
    // @ts-ignore
    const result = await model.instance.process(src);
    console.log(`Inference finished in ${result.elapsed} seconds.`);
    setPredictions({ results: result.results });
    setStatus({ message: "processing finished", processing: false });
  };

  return (
    <>
      <Head>
        <title>Web AI Next.js classification example</title>
        <meta name="description" content="Web AI Next.js classification example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className="container">
          <div className="row">
            <div className="col">
              <h2>Image classification</h2>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <div className="d-flex align-items-center">
                <strong>Status: {status.message}</strong>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 col-sm-12 mb-2">
              <div ref={imageContainerRef} style={{ position: "relative", height: displayDims.height }}>
                <img
                  alt=""
                  ref={imageRef}
                  width={displayDims.width}
                  height={displayDims.height}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              </div>
              {predictions.results && predictions.results.length > 0 && (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Class</th>
                      <th>Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictions.results.map((item, _) => {
                      return (
                        <tr key={item.class}>
                          <td>{item.class}</td>
                          <td>{Math.round(item.confidence * 10000) / 10000}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
            <div className="col-md-6 col-sm-12 mb-2">
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
