import Head from "next/head";
import { useRef, useState } from "react";
import {
  ZeroShotClassificationModel,
  MultimodalModel,
  ModelType,
} from "@visheratin/web-ai/multimodal";
import { ClassificationPrediction } from "@visheratin/web-ai/image";
import ModelSelector from "../../components/modelSelect";

type Item = {
  language: string;
  text: string;
};

export default function ZeroShotClassification() {
  const fileSelectRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<Item[]>([{ language: "", text: "" }]);

  const [imageURL, setImageURL] = useState("");

  const [predictions, setPredictions] = useState({
    results: [] as ClassificationPrediction[],
  });

  const [model, setModel] = useState<ZeroShotClassificationModel>();
  const [languages, setLanguages] = useState<Map<string, string> | undefined>(
    undefined
  );

  const [status, setStatus] = useState({
    message: "select and load the model",
    processing: false,
  });

  const loadModel = async (id: string) => {
    setStatus({ message: "loading the model", processing: true });
    const result = await MultimodalModel.create(id);
    const model = result.model as ZeroShotClassificationModel;
    setModel(model);
    setLanguages(model.metadata.languages);
    setItems([{ language: "", text: "" }]);
    setStatus({ message: "ready", processing: false });
  };

  /**
   * selectFileImage sets the image data from the file select field
   */
  const selectFileImage = () => {
    if (
      fileSelectRef.current &&
      fileSelectRef.current.files &&
      fileSelectRef.current.files[0]
    ) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageURL(reader.result as string);
      };
      reader.readAsDataURL(fileSelectRef.current.files[0]);
    }
  };

  const process = async () => {
    if (model === undefined) {
      return;
    }
    const classes = items.map((item) =>
      item.language !== "" ? item.language + " " + item.text : item.text
    );
    setStatus({ message: "processing the image", processing: true });
    const result = await model.process(imageURL, classes);
    console.log(`Inference finished in ${result.elapsed} seconds.`);
    result.results.forEach((prediction, index) => {
      if (items[index].language !== "") {
        // @ts-ignore
        prediction.class = prediction.class.split(" ").slice(1).join(" ");
      }
    });
    setPredictions({ results: result.results as ClassificationPrediction[] });
    setStatus({ message: "processing finished", processing: false });
  };

  const handleInputChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].text = value;
    setItems(newItems);
  };

  const handleSelectChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].language = value;
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { language: "", text: "" }]);
  };

  return (
    <>
      <Head>
        <title>Web AI Next.js classification example</title>
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
            multimodalType={ModelType.ZeroShotClassification}
            callback={loadModel}
          />
          {model && (
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
                    <div>
                      {items.map((item, index) => (
                        <div key={index} className="d-flex mt-1">
                          {languages && (
                            <div className="col-sm-12 col-md-6 px-1">
                              <select
                                className="form-select"
                                value={item.language}
                                onChange={(e) =>
                                  handleSelectChange(index, e.target.value)
                                }
                              >
                                {[...languages.entries()].map(
                                  ([key, value]) => (
                                    <option key={value} value={value}>
                                      {key}
                                    </option>
                                  )
                                )}
                              </select>
                            </div>
                          )}
                          <div className="col-sm-12 col-md-6 px-1">
                            <input
                              className="form-control"
                              type="text"
                              value={item.text}
                              onChange={(e) =>
                                handleInputChange(index, e.target.value)
                              }
                            />
                          </div>
                        </div>
                      ))}
                      <div className="d-grid gap-2 col-md-3 col-sm-12 mt-2">
                        <button className="btn btn-success" onClick={addItem}>
                          Add class
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="d-grid gap-2 col-md-6 col-sm-12 mx-auto mt-3">
                    <button
                      className="btn btn-primary"
                      type="button"
                      onClick={process}
                      disabled={status.processing}
                    >
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
                            <td>
                              {Math.round(item.confidence * 10000) / 10000}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
