import { Session } from "./session.js";
import * as ort from "onnxruntime-common";
import { GeneratorType } from "./generator.js";
import { ValueMapType } from "./decoder.js";

export class Encoder {
  session: Session;
  outputName: string;
  type: GeneratorType;

  constructor(session: Session, outputName: string, type: GeneratorType) {
    this.session = session;
    this.outputName = outputName;
    this.type = type;
  }

  process = async (
    inputs: ort.Tensor,
    attentionMask?: ort.Tensor,
    encoderOutput?: ort.Tensor
  ): Promise<ort.Tensor> => {
    if (
      attentionMask &&
      (inputs.dims[0] !== attentionMask.dims[0] ||
        inputs.dims[1] !== attentionMask.dims[1])
    ) {
      throw new Error(
        "The dimensions of inputs and attention masks are not equal"
      );
    }
    let encoderFeeds: ValueMapType = {};
    switch (this.type) {
      case GeneratorType.Seq2Seq: {
        if (!attentionMask) {
          throw new Error("Attention mask is not provided");
        }
        encoderFeeds = {
          input_ids: inputs,
          attention_mask: attentionMask,
        };
        const inputNames = await this.session.inputNames();
        if (inputNames.includes("token_type_ids")) {
          const typeIdsTensor = new ort.Tensor(
            "int64",
            new BigInt64Array(inputs.data.length).fill(0n),
            [inputs.dims[0], inputs.dims[1]]
          );
          encoderFeeds["token_type_ids"] = typeIdsTensor;
        }
        if (encoderOutput) {
          encoderFeeds["encoder_hidden_states"] = encoderOutput;
        }
        break;
      }
      case GeneratorType.Img2Seq: {
        encoderFeeds = {
          pixel_values: inputs,
        };
        break;
      }
    }
    const output = await this.session.run(encoderFeeds);
    const result = output[this.outputName];
    return result;
  };
}
