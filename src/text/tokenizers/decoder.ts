export interface DecoderConfig {
  type: string;
  vocab: Map<string, number>;
  prefix?: string;
  cleanup?: boolean;
}

export interface Decoder {
  vocab: Map<number, string>;

  process(tokens: number[]): string;
}

export function NewDecoder(config: DecoderConfig): Decoder {
  switch (config.type.toLowerCase()) {
    case "wordpiece":
      return new WordPieceDecoder(config);
    default:
      throw new Error(`Unknown decoder type: ${config.type}`);
  }
}

export class WordPieceDecoder implements Decoder {
  vocab: Map<number, string>;
  prefix: string;
  cleanup: boolean;

  constructor(config: DecoderConfig) {
    if (config.prefix === undefined) {
      config.prefix = "##";
    }
    if (config.cleanup === undefined) {
      config.cleanup = true;
    }
    this.prefix = config.prefix;
    this.cleanup = config.cleanup;
    this.vocab = new Map<number, string>();
    for (const [key, value] of config.vocab) {
      this.vocab.set(value, key);
    }
  }

  process(tokenIDs: number[]): string {
    const tokens: string[] = [];
    for (const tokenID of tokenIDs) {
      const token = this.vocab.get(tokenID);
      if (token) {
        tokens.push(token);
      }
    }
    return tokens.join(" ").replace(this.prefix, "").trim();
  }
}
