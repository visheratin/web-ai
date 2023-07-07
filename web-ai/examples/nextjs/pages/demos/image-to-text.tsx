import Head from "next/head";
import { useRef, useState } from "react";
import { loadTokenizer, createSession } from "@visheratin/web-ai-browser";
import { MultimodalModel, MultimodalModelType, Img2TextModel } from "@visheratin/web-ai/multimodal";
import ModelSelector from "../../components/modelSelect";

export default function ImageCaption() {
  const fileSelectRef = useRef<HTMLInputElement>(null);
  const prefixRef = useRef<HTMLInputElement>(null);

  const [imageURL, setImageURL] = useState("");

  const [caption, setCaption] = useState("");
  const [prefix, setPrefix] = useState("");

  const [model, setModel] = useState<Img2TextModel | null>(null);

  const [status, setStatus] = useState({ message: "select and load the model", processing: false });

  const loadModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await MultimodalModel.create(id, createSession, loadTokenizer);
    setModel(result.model as Img2TextModel);
    setStatus({ message: "ready", processing: false });
  };

  /**
   * selectFileImage sets the image data from the file select field
   */
  const selectFileImage = () => {
    if (fileSelectRef.current && fileSelectRef.current.files && fileSelectRef.current.files[0]) {
      const reader = new FileReader();
      reader.onload = async () => {
        setImageURL(reader.result as string);
      };
      reader.readAsDataURL(fileSelectRef.current.files[0]);
    }
  };

  const process = async () => {
    if (!model) {
      return;
    }
    const start = Date.now();
    const prefix = prefixRef.current!.value;
    setStatus({ message: "processing the image", processing: true });
    setPrefix(prefix.trim());
    setCaption("");
    let caption = "";
    for await (const piece of model.processStream(imageURL, prefix)) {
      caption = caption.concat(piece[0]);
      setCaption(caption);
    }
    const end = Date.now();
    console.log(`processing took ${end - start} ms`);
    setStatus({ message: "processing finished", processing: false });
  };

  return (
    <>
      <Head>
        <title>Web AI Next.js image to text demo</title>
        <meta name="description" content="Web AI Next.js image to text demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className="container">
          <div className="row">
            <div className="col">
              <h2>Image to text</h2>
              <p>
                Image to text models generate text from the images. Depending on the model, the generated text may be a
                caption for the image or an answer to the question about the image. This demo provides two types of
                models - image captioning and visual question answering. The image captioning models generate a caption
                for the image. The visual question answering models generate an answer to the question about the image.
                I recommend using quantized versions of the models as they are much smaller in size but provide almost
                the same quality as the full-precision models.
              </p>
              <p>How to use the demo:</p>
              <ol>
                <li>Select the model.</li>
                <li>Load the image.</li>
                <li>
                  Enter the prefix. If the selected model is an image captioning model, the prefix is used as a starting
                  point for the caption. If the selected model is a visual question answering model, the prefix is used
                  as a question about the image. For image captioning models, the prefix is optional.
                </li>
                <li>Click the &quot;Process&quot; button.</li>
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
            imageType={undefined}
            multimodalType={MultimodalModelType.Img2Text}
            callback={loadModel}
          />
          <div className="row mt-3">
            <div className="col-md-6 col-sm-12 mb-2">
              <div className="row">
                <div className="col-sm-12">
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
                {imageURL !== "" && model && (
                  <div className="d-grid gap-2 col-md-6 col-sm-12 mx-auto">
                    <button className="btn btn-primary" type="button" onClick={process} disabled={status.processing}>
                      Process
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="col-md-6 col-sm-12 mb-2">
              {imageURL !== "" && (
                <div className="card">
                  <img src={imageURL} className="card-img-top" alt="" />
                  <div className="card-body">
                    <strong>Prefix/question:</strong>
                    <input ref={prefixRef} className="form-control" type="text" disabled={status.processing} />
                    {caption !== "" && (
                      <div className="mt-1">
                        <strong>Result:</strong>
                        <p className="card-text bg-green-300">
                          {prefix} <mark>{caption}</mark>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
