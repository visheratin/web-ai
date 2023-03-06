import Head from "next/head";
import { useEffect, useRef, useState } from "react";
import { TextModel, Seq2SeqModel, ImageModelType, TextModelType } from "@visheratin/web-ai";
import ModelSelector from "../../components/modelSelect";

export default function Summarization() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [output, setOutput] = useState({ value: "Here will be the output" });

  const [model, setModel] = useState({});

  const [status, setStatus] = useState({ message: "ready", processing: false });

  const loadModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await TextModel.create(id);
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
    // @ts-ignore
    for await (const piece of model.instance.processStream(value, "summarize")) {
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
          <div className="row mb-2">
            <div className="col">
              <div className="d-flex align-items-center">
                <strong>Status: {status.message}</strong>
              </div>
            </div>
          </div>
          <ModelSelector
            tags={["summarization"]}
            textType={TextModelType.Seq2Seq}
            imageType={undefined}
            callback={loadModel}
          />
          <div className="row mb-2">
            <div className="col-sm-12">
              <textarea
                ref={inputRef}
                className="form-control"
                disabled={!model || status.processing}
                placeholder="Insert the text here"
                rows={12}
              ></textarea>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-sm-3"></div>
            <div className="col-sm-6">
              <div className="d-grid gap-2">
                <button className="btn btn-lg btn-primary" disabled={!model || status.processing} onClick={process}>
                  Summarize
                </button>
              </div>
            </div>
          </div>
          <div className="row mb-2">
            <div className="col-sm-12">
              <textarea
                className="form-control"
                disabled={!model || status.processing}
                value={output.value}
                rows={6}
              ></textarea>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
