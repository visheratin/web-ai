import { useRef, useState } from "react";
import { Metadata } from "@visheratin/web-ai/common";
import {
  ModelType as ImageModelType,
  ListImageModels,
} from "@visheratin/web-ai/image";
import {
  ModelType as TextModelType,
  ListTextModels,
} from "@visheratin/web-ai/text";
import {
  ModelType as MultimodalModelType,
  ListMultimodalModels,
} from "@visheratin/web-ai/multimodal";

interface ModelSelectorProps {
  tags: string[] | undefined;
  imageType?: ImageModelType;
  textType?: TextModelType;
  multimodalType?: MultimodalModelType;
  callback: (id: string) => void;
}

export default function ModelSelector(props: ModelSelectorProps) {
  const selectRef = useRef<HTMLSelectElement>(null);
  const [metadata, setMetadata] = useState({
    models: [] as Metadata[],
  });

  useState(() => {
    if (props.imageType !== undefined) {
      const models = ListImageModels(props.tags, props.imageType);
      setMetadata({ models: models });
    } else {
      if (props.textType !== undefined) {
        const models = ListTextModels(props.tags, props.textType);
        setMetadata({ models: models });
      } else {
        if (props.multimodalType !== undefined) {
          const models = ListMultimodalModels(props.tags, props.multimodalType);
          setMetadata({ models: models });
        }
      }
    }
  });

  const selectModel = () => {
    const id = selectRef.current?.value;
    if (id !== undefined) {
      props.callback(id);
    }
  };

  return (
    <>
      <div className="row mb-2">
        <div className="col-md-10 col-sm-12 mt-1">
          <select ref={selectRef} className="form-select">
            {metadata.models.map((model) => (
              <option key={model.id} value={model.id}>
                {model.title}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2 col-sm-12 mt-1">
          <button
            className="btn btn-primary btn-block"
            style={{ width: "100%" }}
            onClick={selectModel}
          >
            Select
          </button>
        </div>
      </div>
    </>
  );
}
