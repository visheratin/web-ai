import Jimp from "jimp";
import Head from "next/head";
import { useLayoutEffect, useRef, useState } from "react";
import { TextModel, Seq2SeqModel } from "@visheratin/web-ai";

export default function Classification() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [output, setOutput] = useState({ value: "Here will be the output" });

  useLayoutEffect(() => {
    loadModel();
  }, []);

  const [model, setModel] = useState({});

  const [status, setStatus] = useState({ message: "ready", processing: false });

  const loadModel = async () => {
    setStatus({ message: "loading the model", processing: true });
    const result = await TextModel.create("summarization-t5");
    setModel({ instance: result.model as Seq2SeqModel });
    setStatus({ message: "ready", processing: false });
  };

  const process = async () => {
    if (!inputRef.current || !model) {
      return;
    }
    const value = inputRef.current?.value;
    if (value === "" || value === undefined) {
      return;
    }
    setStatus({ message: "processing", processing: true });
    let output = "";
    for await (const piece of model.instance.processStream(value)) {
      output = output.concat(piece);
      output = output.replace(" .", ".");
      setOutput({ value: output });
    }
    setStatus({ message: "finished processing", processing: false });
  };

  return (
    <>
      <Head>
        <title>Web AI Next.js text summarization example</title>
        <meta name="description" content="Web AI Next.js classification example" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <div className="container">
          <div className="row">
            <div className="col">
              <h1>Text summarization example</h1>
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
            <div className="col-sm-12">
              <h6>Input</h6>
              <textarea
                ref={inputRef}
                className="form-control"
                disabled={!model || status.processing}
                placeholder="Insert the text here"
              ></textarea>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <button className="btn btn-primary" disabled={!model || status.processing} onClick={process}>
                Process
              </button>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <h6>Output</h6>
              <textarea className="form-control" disabled={!model || status.processing} value={output.value}></textarea>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
