import Jimp from "jimp";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { loadTokenizer, createSession } from "@visheratin/web-ai-browser";
import { ImageModel, ImageModelType, Img2ImgModel } from "@visheratin/web-ai/image";
import ModelSelector from "../../components/modelSelect";

export default function SuperResolution() {
  const inImageRef = useRef<HTMLImageElement>(null);
  const inImageContainerRef = useRef<HTMLDivElement>(null);
  const outImageRef = useRef<HTMLImageElement>(null);
  const outImageContainerRef = useRef<HTMLDivElement>(null);
  const fileSelectRef = useRef<HTMLInputElement>(null);

  const [displayDims, setDisplayDims] = useState({
    width: 0,
    height: 0,
    aspectRatio: 1,
  });

  const setImageSize = (aspectRatio = 1) => {
    if (inImageContainerRef.current) {
      let imgSize = inImageContainerRef.current.offsetWidth - 11;
      imgSize = imgSize > 800 ? 800 : imgSize;
      setDisplayDims({
        width: imgSize,
        height: imgSize * aspectRatio,
        aspectRatio: aspectRatio,
      });
    }
  };

  useEffect(() => {
    setImageSize();
  }, []);

  const [model, setModel] = useState({});

  const [status, setStatus] = useState({ message: "select and load the model", processing: false });

  const loadModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await ImageModel.create(id, createSession);
    setModel({ instance: result.model as Img2ImgModel });
    setStatus({ message: "ready", processing: false });
  };

  /**
   * selectFileImage sets the image data from the file select field
   */
  const selectFileImage = () => {
    if (fileSelectRef.current && fileSelectRef.current.files && fileSelectRef.current.files[0]) {
      inImageRef.current!.src = URL.createObjectURL(fileSelectRef.current.files[0]);
      const reader = new FileReader();
      reader.onload = async () => {
        loadImage(reader.result as ArrayBuffer);
      };
      reader.readAsArrayBuffer(fileSelectRef.current.files[0]);
    }
  };

  const loadImage = async (fileData: ArrayBuffer) => {
    setStatus({ message: "processing the image", processing: true });
    // @ts-ignore
    const imageBuffer = await Jimp.read(fileData);
    setImageSize(imageBuffer.bitmap.height / imageBuffer.bitmap.width);
    // @ts-ignore
    const restored = await model.instance.process(fileData, 800);
    const imgData = renderRestored(restored.data);
    outImageRef.current!.src = imgData;
    setStatus({ message: "processing finished", processing: false });
  };

  const renderRestored = (data: ImageData): string => {
    const renderCanvas = document.createElement("canvas");
    renderCanvas.width = data.width;
    renderCanvas.height = data.height;
    const renderCtx = renderCanvas.getContext("2d");
    renderCtx!.putImageData(data, 0, 0);
    return renderCanvas.toDataURL("image/png");
  };

  return (
    <>
      <Head>
        <title>Web AI Next.js super-resolution example</title>
        <meta name="description" content="Web AI Next.js super-resolution example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className="container">
          <div className="row">
            <div className="col">
              <h2>Image super-resolution</h2>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col">
              <div className="d-flex align-items-center">
                <strong>Status: {status.message}</strong>
              </div>
            </div>
          </div>
          <ModelSelector
            tags={["superres"]}
            textType={undefined}
            imageType={ImageModelType.Img2Img}
            callback={loadModel}
          />
          <div className="row">
            <div className="col-md-6 col-sm-12 mb-2">
              <div ref={inImageContainerRef} style={{ position: "relative", height: displayDims.height }}>
                <img
                  alt=""
                  ref={inImageRef}
                  width={displayDims.width}
                  height={displayDims.height}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              </div>
            </div>
            <div className="col-md-6 col-sm-12 mb-2">
              <div ref={outImageContainerRef} style={{ position: "relative", height: displayDims.height }}>
                <img
                  alt=""
                  ref={outImageRef}
                  width={displayDims.width}
                  height={displayDims.height}
                  style={{ position: "absolute", top: 0, left: 0 }}
                />
              </div>
            </div>
          </div>
          <div className="row">
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
