import Jimp from "jimp";
import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { loadTokenizer, createSession } from "@visheratin/web-ai-browser";
import { ZeroShotClassificationModel, MultimodalModel, MultimodalModelType } from "@visheratin/web-ai/multimodal";
import { ClassificationPrediction } from "@visheratin/web-ai/image";
import ModelSelector from "../../components/modelSelect";

export default function ZeroShotClassification() {
  const fileSelectRef = useRef<HTMLInputElement>(null);
  const classTextAreaRef = useRef<HTMLTextAreaElement>(null);

  const [imageURL, setImageURL] = useState("");

  const [predictions, setPredictions] = useState({
    results: [] as ClassificationPrediction[],
  });

  const [model, setModel] = useState({});

  const [status, setStatus] = useState({ message: "select and load the model", processing: false });

  const loadModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await MultimodalModel.create(id, createSession, loadTokenizer);
    setModel(result.model as ZeroShotClassificationModel);
    setStatus({ message: "ready", processing: false });
  };

  /**
   * selectFileImage sets the image data from the file select field
   */
  const selectFileImage = () => {
    if (fileSelectRef.current && fileSelectRef.current.files && fileSelectRef.current.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageURL(reader.result as string);
      };
      reader.readAsDataURL(fileSelectRef.current.files[0]);
    }
  };

  const process = async () => {
    const classes = classTextAreaRef.current!.value.split("\n");
    setStatus({ message: "processing the image", processing: true });
    // @ts-ignore
    const result = await model.process(imageURL, classes);
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
              <h2>Zero-shot image classification</h2>
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
            multimodalType={MultimodalModelType.ZeroShotClassification}
            callback={loadModel}
          />
          <div className="row">
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
                <div className="col-sm-12 mb-2">
                  <h6>Set the classes</h6>
                  <textarea
                    ref={classTextAreaRef}
                    className="form-control"
                    rows={6}
                    disabled={status.processing}
                  ></textarea>
                </div>
                <div className="d-grid gap-2 col-md-6 col-sm-12 mx-auto">
                  <button className="btn btn-primary" type="button" onClick={process} disabled={status.processing}>
                    Process
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-sm-12 mb-2">
              {imageURL !== "" && (
                <div className="card">
                  <img src={imageURL} className="card-img-top" alt="" />
                </div>
              )}
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
          </div>
        </div>
      </main>
    </>
  );
}
