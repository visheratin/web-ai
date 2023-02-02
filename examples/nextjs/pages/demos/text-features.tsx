import Jimp from "jimp";
import Head from "next/head";
import { useLayoutEffect, useRef, useState } from "react";
import { TextModel, FeatureExtractionModel } from "@visheratin/web-ai";

export default function Classification() {
  const input1Ref = useRef<HTMLTextAreaElement>(null);
  const input2Ref = useRef<HTMLTextAreaElement>(null);
  const [result, setResult] = useState({ value: 0.0, className: "" });

  useLayoutEffect(() => {
    loadModel();
  }, []);

  const [model, setModel] = useState({});

  const [status, setStatus] = useState({ message: "ready", processing: false });

  const loadModel = async () => {
    setStatus({ message: "loading the model", processing: true });
    const result = await TextModel.create("sentence-t5-quant");
    setModel({ instance: result.model as FeatureExtractionModel });
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
    const result1 = await model.instance.process(value1);
    if (!result1.cached) {
      console.log(
        `Sentence of length ${value1.length} (${result1.tokensNum} tokens) was processed in ${result1.elapsed} seconds`,
      );
    }
    console.log(result1.result);
    const result2 = await model.instance.process(value2);
    if (!result2.cached) {
      console.log(
        `Sentence of length ${value2.length} (${result2.tokensNum} tokens) was processed in ${result2.elapsed} seconds`,
      );
    }
    console.log(result2.result);
    const sim = cosineSim(result1.result, result2.result);
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
    console.log(dotproduct, m1, m2);
    const sim = dotproduct / (m1 * m2);
    return sim;
  };

  return (
    <>
      <Head>
        <title>Web AI Next.js text feature extraction example</title>
        <meta name="description" content="Web AI Next.js classification example" />
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
                <button className="btn btn-lg btn-primary" disabled={!model || status.processing} onClick={process}>
                  Process
                </button>
              </div>
            </div>
          </div>
          <div className="row mb-2 mt-4">
            <div className="col-sm-3"></div>
            <div className="col-sm-6">
              <div
                className="progress"
                role="progressbar"
                aria-label="Success example"
                aria-valuenow="25"
                aria-valuemin="-100"
                aria-valuemax="100"
              >
                <div className={result.className} style={{ width: `${result.value * 100}%` }}></div>
              </div>
            </div>
            <div className="row mb-2">
              <div className="col-sm-3"></div>
              <div className="col-sm-6">
                <p className="text-center">Simimarity score of the text pieces is {result.value}.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
