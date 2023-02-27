export interface PreTokenizerConfig {
  type: string;
  preTokenizers?: PreTokenizerConfig[];
  charDelimiter?: string;
  replacement?: string;
  addPrefixSpace?: boolean;
  trimOffsets?: boolean;
}

export interface PreTokenizer {
  config: PreTokenizerConfig;

  process(str: string): string[];
}

export function NewPreTokenizer(config: PreTokenizerConfig): PreTokenizer {
  switch (config.type.toLowerCase()) {
    case "whitespace":
      return new Whitespace(config);
    case "whitespacesplit":
      return new WhitespaceSplit(config);
    case "punctuation":
      return new Punctuation(config);
    case "chardelimitersplit":
      return new CharDelimiterSplit(config);
    case "bert":
      return new BertPreTokenizer(config);
    case "metaspace":
      return new Metaspace(config);
    default:
      throw new Error(`Unknown preTokenizer type: ${config.type}`);
  }
}

export class ByteLevel implements PreTokenizer {
  config: PreTokenizerConfig;

  constructor(config: PreTokenizerConfig) {
    this.config = config;
  }

  process(str: string): string[] {
    const regex = /'s|'t|'re|'ve|'m|'ll|'d| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;
    if (this.config.addPrefixSpace) {
      str = " " + str;
    }
    const partsIter = str.matchAll(regex);
    const parts = Array.from(partsIter).map((part) => part[0]);
    return parts;
  }
}

export class Whitespace implements PreTokenizer {
  config: PreTokenizerConfig;

  constructor(config: PreTokenizerConfig) {
    this.config = config;
  }

  process(str: string): string[] {
    const regex = /\w+|[^\w\s]+/gu;
    const partsIter = str.matchAll(regex);
    const parts = Array.from(partsIter).map((part) => part[0]);
    return parts;
  }
}

export class WhitespaceSplit implements PreTokenizer {
  config: PreTokenizerConfig;

  constructor(config: PreTokenizerConfig) {
    this.config = config;
  }

  process(str: string): string[] {
    return str.split(" ");
  }
}

export class Punctuation implements PreTokenizer {
  config: PreTokenizerConfig;

  constructor(config: PreTokenizerConfig) {
    this.config = config;
  }

  process(str: string): string[] {
    const regex = /([.,\/#!$%\^&\*;:{}=\-_`~()])/gu;
    return str.split(regex);
  }
}

export class Metaspace implements PreTokenizer {
  config: PreTokenizerConfig;

  constructor(config: PreTokenizerConfig) {
    this.config = config;
  }

  process(str: string): string[] {
    if (!this.config.replacement) {
      throw new Error("Missing replacement in Metaspace preTokenizer");
    }
    str = str.replaceAll(" ", this.config.replacement);
    if (this.config.addPrefixSpace && !str.startsWith(this.config.replacement)) {
      str = this.config.replacement + str;
    }
    const regex = RegExp("(?=" + this.config.replacement + ")", "g");
    return str.split(regex);
  }
}

export class CharDelimiterSplit implements PreTokenizer {
  config: PreTokenizerConfig;

  constructor(config: PreTokenizerConfig) {
    this.config = config;
  }

  process(str: string): string[] {
    if (!this.config.charDelimiter) {
      throw new Error("Missing charDelimiter in CharDelimiterSplit preTokenizer");
    }
    return str.split(this.config.charDelimiter);
  }
}

export class BertPreTokenizer implements PreTokenizer {
  config: PreTokenizerConfig;

  constructor(config: PreTokenizerConfig) {
    this.config = config;
  }

  process(str: string): string[] {
    const regex = /\b\w+\b|[^\s\w]+/gu;
    const partsIter = str.matchAll(regex);
    const parts = Array.from(partsIter).map((part) => part[0]);
    return parts;
  }
}

export class Sequence implements PreTokenizer {
  config: PreTokenizerConfig;

  constructor(config: PreTokenizerConfig) {
    this.config = config;
  }

  process(str: string): string[] {
    if (!this.config.preTokenizers) {
      throw new Error("Missing tokenizers in Sequence preTokenizer");
    }
    let parts = [str];
    for (const tokenizerConfig of this.config.preTokenizers) {
      const tokenizer = NewPreTokenizer(tokenizerConfig);
      const newParts: string[] = [];
      for (const part of parts) {
        newParts.push(...tokenizer.process(part));
      }
      parts = newParts;
    }
    return parts;
  }
}
