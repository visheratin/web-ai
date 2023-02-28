import { Lattice } from "./lattice";
import { Trie } from "./trie";

export interface ModelConfig {
  type: string;
  vocab: Map<string, number>;
  bosToken: string;
  eosToken: string;
  unknownToken: string;
  maxInputCharsPerWord: number;
  continuingSubwordPrefix: string;
  merges: string[];
}

export function NewModel(config: ModelConfig): Model {
  switch (config.type.toLowerCase()) {
    case "wordlevel":
      return new WordLevel(config);
    case "unigram":
      return new Unigram(config);
    case "bpe":
      return new BPE(config);
    case "wordpiece":
      return new WordPiece(config);
    default:
      throw new Error(`Unknown model type: ${config.type}`);
  }
}

export interface Model {
  process(parts: string[]): number[];
}

export class WordLevel implements Model {
  vocab: Map<string, number>;
  unknownTokenID: number;

  constructor(config: ModelConfig) {
    this.vocab = config.vocab;
    const unknownToken = config.unknownToken;
    const unknownTokenID = this.vocab.get(unknownToken);
    if (unknownTokenID === undefined) {
      throw new Error("unknownToken is not in the vocab");
    }
    this.unknownTokenID = unknownTokenID;
  }

  process(parts: string[]): number[] {
    const tokens: number[] = [];
    for (const token of parts) {
      const id = this.vocab.get(token);
      if (id) {
        tokens.push(id);
      } else {
        tokens.push(this.unknownTokenID);
      }
    }
    return tokens;
  }
}

export class Unigram implements Model {
  bosToken: string;
  bosTokenID: number;
  eosToken: string;
  eosTokenID: number;
  unknownToken: string;
  unknownTokenID: number;
  private tokenToIDs: Map<string, number>;
  private unknownTokenScore: number;
  private vocab: Map<string, number>;
  private trie: Trie;

  constructor(config: ModelConfig) {
    this.vocab = config.vocab;
    this.tokenToIDs = new Map();
    let c = 0;
    for (const token of this.vocab.keys()) {
      this.tokenToIDs.set(token, c);
      c++;
    }
    this.bosToken = config.bosToken;
    const bosTokenID = this.tokenToIDs.get(this.bosToken);
    if (bosTokenID === undefined) {
      throw new Error("bosToken is not in the vocab");
    }
    this.bosTokenID = bosTokenID;
    this.eosToken = config.eosToken;
    const eosTokenID = this.tokenToIDs.get(this.eosToken);
    if (eosTokenID === undefined) {
      throw new Error("eosToken is not in the vocab");
    }
    this.eosTokenID = eosTokenID;
    this.unknownToken = config.unknownToken;
    const unknownTokenID = this.tokenToIDs.get(this.unknownToken);
    if (unknownTokenID === undefined) {
      throw new Error("unknownToken is not in the vocab");
    }
    this.unknownTokenID = unknownTokenID;
    this.trie = new Trie();
    let minScore = 1.0e6;
    this.vocab.forEach((x) => (minScore = Math.min(minScore, x)));
    this.unknownTokenScore = minScore - 10.0;
    this.vocab.set(this.unknownToken, this.unknownTokenScore);
    this.vocab.forEach((_, k) => this.trie.push(k));
  }

  process(parts: string[]): number[] {
    const tokens: number[] = [];
    for (const token of parts) {
      const lattice = new Lattice(token, this.bosTokenID, this.eosTokenID);
      this.populateNodes(lattice);
      const tokenIDs = lattice.tokenIDs();
      tokens.push(...tokenIDs);
    }
    return tokens;
  }

  populateNodes(lattice: Lattice) {
    const sentence = lattice.sentence;
    const len = sentence.length;
    let beginPos = 0;
    while (beginPos < len) {
      const mblen = 1;
      let hasSingleNode = false;
      const tokens: string[] = [];
      for (const token of this.trie.commonPrefixSearch(sentence.slice(beginPos))) {
        tokens.push(token);
        const tokenID = this.tokenToIDs.get(token) || this.unknownTokenID;
        const tokenScore = Number(this.vocab[tokenID][1]);
        const n = token.length;
        lattice.insert(beginPos, n, tokenScore, tokenID);
        if (!hasSingleNode && n == mblen) {
          hasSingleNode = true;
        }
      }
      if (!hasSingleNode) {
        lattice.insert(beginPos, mblen, this.unknownTokenScore, this.unknownTokenID);
      }
      beginPos += mblen;
    }
  }
}

export class WordPiece implements Model {
  vocab: Map<string, number>;
  unknownTokenID: number;
  maxInputCharsPerWord: number;
  continuingSubwordPrefix: string;

  constructor(config: ModelConfig) {
    this.vocab = config.vocab;
    const unknownToken = config.unknownToken;
    const unknownTokenID = this.vocab.get(unknownToken);
    if (unknownTokenID === undefined) {
      throw new Error("unknownToken is not in the vocab");
    }
    this.unknownTokenID = unknownTokenID;
    this.maxInputCharsPerWord = config.maxInputCharsPerWord;
    this.continuingSubwordPrefix = config.continuingSubwordPrefix;
  }

  process(parts: string[]): number[] {
    let tokens: number[] = [];
    for (let token of parts) {
      let chars = [...token];
      if (chars.length > this.maxInputCharsPerWord) {
        tokens.push(this.unknownTokenID);
        continue;
      }
      let isUnknown = false;
      let start = 0;
      let subTokens: number[] = [];
      while (start < chars.length) {
        let end = chars.length;
        let substringID: number | undefined = undefined;
        while (start < end) {
          let substr = chars.slice(start, end).join("");
          if (start > 0) {
            substr = this.continuingSubwordPrefix + substr;
          }
          if (this.vocab.has(substr)) {
            substringID = this.vocab.get(substr);
            break;
          }
          --end;
        }
        if (substringID === undefined) {
          isUnknown = true;
          break;
        }
        subTokens.push(substringID);
        start = end;
      }
      if (isUnknown) {
        tokens.push(this.unknownTokenID);
      } else {
        tokens.push(...subTokens);
      }
    }
    return tokens;
  }
}

export class BPE implements Model {
  encoder: Map<string, number>;
  byteEncoder: { [k: string]: string };
  bpeRanks: { [k: string]: number };

  constructor(config: ModelConfig) {
    this.encoder = config.vocab;
    this.byteEncoder = this.bytesToUnicode();
    this.bpeRanks = Object.fromEntries(config.merges.map((x, i) => [x, i]));
  }

  process(parts: string[]): number[] {
    let tokens: number[] = [];
    for (let part of parts) {
      const token = [...part].map((b) => this.byteEncoder[b.charCodeAt(0)]).join("");
      tokens.push(
        ...this.bpe(token)
          .split(" ")
          .map((bpe_token) => this.encoder[bpe_token]),
      );
    }
    return tokens;
  }

  bpe(token: string) {
    let word = [...token.slice(0, -1), token.slice(-1) + "</w>"];
    let pairs = this.getPairs(word);

    if (pairs.length === 0) {
      return token + "</w>";
    }

    while (1) {
      let bigram: string[] | null = null;
      let minRank = Infinity;
      for (let p of pairs) {
        let r = this.bpeRanks[p.join("")];
        if (r === undefined) continue;
        if (r < minRank) {
          minRank = r;
          bigram = p;
        }
      }
      if (bigram === null) {
        break;
      }
      let [first, second] = bigram;
      let newWord: string[] = [];
      let i = 0;
      while (i < word.length) {
        let j = word.indexOf(first, i);
        if (j === -1) {
          newWord.push(...word.slice(i));
          break;
        }
        newWord.push(...word.slice(i, j));
        i = j;

        if (word[i] === first && i < word.length - 1 && word[i + 1] === second) {
          newWord.push(first + second);
          i += 2;
        } else {
          newWord.push(word[i]);
          i += 1;
        }
      }
      word = newWord;
      if (word.length === 1) {
        break;
      } else {
        pairs = this.getPairs(word);
      }
    }
    const res = word.join(" ");
    return res;
  }

  ord(c) {
    return c.charCodeAt(0);
  }

  range(start: number, stop?: number, step = 1) {
    if (stop === undefined) {
      stop = start;
      start = 0;
    }
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
      return [];
    }
    const result: number[] = [];
    for (let i = start; step > 0 ? i < stop : i > stop; i += step) {
      result.push(i);
    }
    return result;
  }

  bytesToUnicode() {
    let bs = [
      ...this.range(this.ord("!"), this.ord("~") + 1),
      ...this.range(this.ord("¡"), this.ord("¬") + 1),
      ...this.range(this.ord("®"), this.ord("ÿ") + 1),
    ];
    let cs = bs.slice(0);
    let n = 0;
    for (let b of this.range(2 ** 8)) {
      if (!bs.includes(b)) {
        bs.push(b);
        cs.push(2 ** 8 + n);
        n += 1;
      }
    }
    const ss = cs.map((n) => String.fromCharCode(n));
    return Object.fromEntries(bs.map((v, i) => [v, ss[i]]));
  }

  getPairs(word: string[]) {
    let pairs: string[][] = [];
    let prevChar = word[0];
    for (let char of word.slice(1)) {
      pairs.push([prevChar, char]);
      prevChar = char;
    }
    return pairs;
  }
}
