interface ReplaceConfig {
  string?: string;
  regex?: string;
  replacement?: string;
}

export interface NormalizerConfig {
  type: string;
  replace?: ReplaceConfig;
  cleanText?: boolean;
  handleChineseChars?: boolean;
  stripAccents?: boolean;
  lowercase?: boolean;
  normalizers?: NormalizerConfig[];
}

interface Normalizer {
  config: NormalizerConfig;

  process(str: string): string;
}

export function NewNormalizer(config: NormalizerConfig): Normalizer {
  switch (config.type.toLowerCase()) {
    case "nfd":
      return new NFD(config);
    case "nfkd":
      return new NFKD(config);
    case "nfc":
      return new NFC(config);
    case "nfkc":
      return new NFKC(config);
    case "lowercase":
      return new Lowercase(config);
    case "strip":
      return new Strip(config);
    case "stripaccents":
      return new StripAccents(config);
    case "replace":
      return new Replace(config);
    case "bertnormalizer":
      return new BertNormalizer(config);
    case "sequence":
      return new Sequence(config);
    default:
      throw new Error(`Unknown normalizer type: ${config.type}`);
  }
}

export class NFD implements Normalizer {
  config: NormalizerConfig;

  constructor(config: NormalizerConfig) {
    this.config = config;
  }

  process(str: string): string {
    return str.normalize("NFD");
  }
}

export class NFKD implements Normalizer {
  config: NormalizerConfig;

  constructor(config: NormalizerConfig) {
    this.config = config;
  }

  process(str: string): string {
    return str.normalize("NFKD");
  }
}

export class NFC implements Normalizer {
  config: NormalizerConfig;

  constructor(config: NormalizerConfig) {
    this.config = config;
  }

  process(str: string): string {
    return str.normalize("NFC");
  }
}

export class NFKC implements Normalizer {
  config: NormalizerConfig;

  constructor(config: NormalizerConfig) {
    this.config = config;
  }

  process(str: string): string {
    return str.normalize("NFKC");
  }
}

export class Lowercase implements Normalizer {
  config: NormalizerConfig;

  constructor(config: NormalizerConfig) {
    this.config = config;
  }

  process(str: string): string {
    return str.toLowerCase();
  }
}

export class Strip implements Normalizer {
  config: NormalizerConfig;

  constructor(config: NormalizerConfig) {
    this.config = config;
  }

  process(str: string): string {
    return str.trim();
  }
}

export class StripAccents implements Normalizer {
  config: NormalizerConfig;

  constructor(config: NormalizerConfig) {
    this.config = config;
  }

  process(str: string): string {
    return str.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "");
  }
}

export class Replace implements Normalizer {
  config: NormalizerConfig;

  constructor(config: NormalizerConfig) {
    this.config = config;
  }

  process(str: string): string {
    if (!this.config.replace) {
      throw new Error("Missing replace in Replace normalizer");
    }
    if (this.config.replace.string) {
      return str.replaceAll(this.config.replace.string, this.config.replace.replacement || "");
    }
    if (this.config.replace.regex) {
      return str.replaceAll(new RegExp(this.config.replace.regex, "g"), this.config.replace.replacement || "");
    }
    throw new Error("Missing string or regex in Replace normalizer");
  }
}

export class BertNormalizer implements Normalizer {
  config: NormalizerConfig;

  constructor(config: NormalizerConfig) {
    this.config = config;
  }

  isWhiteSpace(char: string): boolean {
    if (char.length !== 1) {
      throw new Error("Invalid character");
    }
    const charCode = char.charCodeAt(0);
    if (
      charCode === 0x20 ||
      charCode === 0x90 ||
      charCode === 0xa0 ||
      charCode === 0x0a ||
      charCode === 0x09 ||
      charCode === 0x0d
    ) {
      return true;
    }
    return false;
  }

  isControl(char: string): boolean {
    if (char.length !== 1) {
      throw new Error("Invalid character");
    }
    if (char === "\t" || char === "\n" || char === "\r") {
      return false;
    }
    const charCode = char.charCodeAt(0);
    if (charCode === 0 || charCode === 0xfffd || char.match(/\p{Other}/gu)) {
      return true;
    }
    return false;
  }

  isChineseChar(char: string): boolean {
    if (char.length !== 1) {
      throw new Error("Invalid character");
    }
    const charCode = char.charCodeAt(0);
    if (
      (charCode >= 0x4e00 && charCode <= 0x9fff) ||
      (charCode >= 0x3400 && charCode <= 0x4dbf) ||
      (charCode >= 0x20000 && charCode <= 0x2a6df) ||
      (charCode >= 0x2a700 && charCode <= 0x2b73f) ||
      (charCode >= 0x2b740 && charCode <= 0x2b81f) ||
      (charCode >= 0x2b820 && charCode <= 0x2ceaf) ||
      (charCode >= 0xf900 && charCode <= 0xfadf) ||
      (charCode >= 0x2f800 && charCode <= 0x2fa1f)
    ) {
      return true;
    }
    return false;
  }

  process(str: string): string {
    if (this.config.cleanText) {
      let res = "";
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (this.isControl(char)) {
          continue;
        }
        if (this.isWhiteSpace(char)) {
          res += " ";
        } else {
          res += char;
        }
      }
      str = res;
    }
    if (this.config.handleChineseChars) {
      let res = "";
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (this.isChineseChar(char)) {
          res += " ";
          res += char;
          res += " ";
        } else {
          res += char;
        }
      }
      str = res;
    }
    if (this.config.stripAccents) {
      str = str.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "");
    }
    if (this.config.lowercase) {
      str = str.toLowerCase();
    }
    return str;
  }
}

export class Sequence implements Normalizer {
  config: NormalizerConfig;
  normalizers: Normalizer[];

  constructor(config: NormalizerConfig) {
    this.config = config;
    if (!config.normalizers) {
      throw new Error("Missing normalizers in Sequence normalizer");
    }
    this.normalizers = config.normalizers.map((normalizerConfig) => NewNormalizer(normalizerConfig));
  }

  process(str: string): string {
    return this.normalizers.reduce((acc, normalizer) => {
      return normalizer.process(acc);
    }, str);
  }
}
