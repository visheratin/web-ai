import Head from "next/head";
import { useRef, useState } from "react";
import {
  TextModel,
  TextFeatureExtractionModel,
  TextModelType,
} from "@visheratin/web-ai/text";
import ModelSelector from "../../components/modelSelect";

export default function Classification() {
  const input1Ref = useRef<HTMLTextAreaElement>(null);
  const input2Ref = useRef<HTMLTextAreaElement>(null);
  const [result, setResult] = useState({ value: 0.0, className: "" });

  const [model, setModel] = useState({});

  const [status, setStatus] = useState({
    message: "select and load the model",
    processing: false,
  });

  const loadModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await TextModel.create(id);
    setModel({ instance: result.model as TextFeatureExtractionModel });
    setStatus({ message: "ready", processing: false });
  };

  const process = async () => {
    if (!input1Ref.current || !input2Ref.current || !model) {
      return;
    }
    const value1 = input1Ref.current?.value;
    if (value1 === "" || value1 === undefined) {
      return;
    }
    const value2 = input2Ref.current?.value;
    if (value2 === "" || value2 === undefined) {
      return;
    }
    setStatus({ message: "processing", processing: true });
    // @ts-ignore
    const result = await model.instance.process([value1, value2]);
    if (!result.cached) {
      console.log(
        `Sentences of length ${value1.length + value2.length} (${
          result.tokensNum
        } tokens) were processed in ${result.elapsed} seconds`
      );
    }
    let sim = cosineSim(result.result[0], result.result[1]);
    sim = Math.round((sim + Number.EPSILON) * 100) / 100;
    let className = "bg-info";
    if (sim > 0.75) {
      className = "bg-success";
    }
    if (sim < 0.25) {
      className = "bg-danger";
    }
    setResult({ value: sim, className: className });
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
        <title>Web AI Next.js text feature extraction example</title>
        <meta
          name="description"
          content="Web AI Next.js classification example"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className="container">
          <div className="row">
            <div className="col">
              <h1>Text feature extraction example</h1>
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
            tags={undefined}
            textType={TextModelType.FeatureExtraction}
            imageType={undefined}
            callback={loadModel}
          />
          <div className="row mb-2">
            <div className="col-sm-12">
              <textarea
                ref={input1Ref}
                className="form-control"
                disabled={!model || status.processing}
                placeholder="Insert the first text here"
                rows={4}
              ></textarea>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-sm-12">
              <textarea
                ref={input2Ref}
                className="form-control"
                disabled={!model || status.processing}
                placeholder="Insert the second text here"
                rows={4}
              ></textarea>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-sm-3"></div>
            <div className="col-sm-6">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-lg btn-primary"
                  disabled={!model || status.processing}
                  onClick={process}
                >
                  Process
                </button>
              </div>
            </div>
          </div>
          <div className="row mb-2 mt-4">
            <div className="col-sm-3"></div>
            <div className="col-sm-6">
              <div className="progress" role="progressbar">
                <div
                  className={result.className}
                  style={{ width: `${((result.value + 1) / 2) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-sm-3"></div>
              <div className="col-sm-6">
                <p className="text-center">
                  Simimarity score of the text pieces is {result.value}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
