import Head from "next/head";
import { useRef, useState } from "react";
import { loadTokenizer, createSession } from "@visheratin/web-ai-browser";
import { TextModel, Seq2SeqModel, TextModelType } from "@visheratin/web-ai/text";
import { split } from "sentence-splitter";
import ModelSelector from "../../components/modelSelect";

export default function Summarization() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [textThreshold, setTextThreshold] = useState(800);
  const [output, setOutput] = useState({ value: "Here will be the output" });

  const [model, setModel] = useState({});

  const [status, setStatus] = useState({ message: "select and load the model", processing: false });

  const loadModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await TextModel.create(id, createSession, loadTokenizer);
    setModel({ instance: result.model as Seq2SeqModel });
    setStatus({ message: "ready", processing: false });
  };

  const splitText = (text: string): Array<string> => {
    const parts = split(text);
    const result: string[] = [];
    let currentPart = "";
    const lenThreshold = textThreshold;
    if (lenThreshold === 0) {
      return [text];
    }
    for (const part of parts) {
      if (part.type === "Sentence") {
        for (const childNode of part.children) {
          if (currentPart.length + childNode.value.length > lenThreshold) {
            result.push(currentPart);
            currentPart = "";
          }
          currentPart = currentPart.concat(" " + childNode.value);
        }
      } else {
        if (currentPart.length + part.value.length > lenThreshold) {
          result.push(currentPart);
          currentPart = "";
        }
        currentPart = currentPart.concat(" " + part.value);
      }
    }
    return result;
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
    const textParts = splitText(value);
    const output = new Array<string>(textParts.length).fill("");
    for (let i = 0; i < textParts.length; i += 4) {
      const parts = textParts.slice(i, i + 4);
      // @ts-ignore
      for await (const pieces of model.instance.processStream(parts, "summarize")) {
        for (let j = 0; j < pieces.length; j++) {
          output[i + j] = output[i + j].concat(pieces[j]);
        }
        let value = output.join("\n");
        value = value.replace(" .", ".");
        setOutput({ value: value });
      }
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
              <label htmlFor="textThreshold" className="form-label">
                Text part length: {textThreshold}
              </label>
              <input
                type="range"
                className="form-range"
                min="0"
                max="1000"
                step="50"
                defaultValue={textThreshold}
                id="textThreshold"
                onChange={(e) => setTextThreshold(parseFloat(e.target.value))}
              />
            </div>
          </div>
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
