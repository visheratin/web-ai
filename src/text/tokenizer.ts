/**
 * This tokenizer is a copy of
 * https://github.com/praeclarum/transformers-js/blob/main/src/tokenizers.js
 *
 * MIT License
 *
 * Copyright (c) 2022 Frank A. Krueger
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

class Tokenizer {
  constructor(
    vocab,
    unkTokenId,
    specialTokens,
    normalizer,
    preTokenizer,
    decoder
  ) {
    this.vocab = vocab;
    this.unkTokenId = unkTokenId;
    this.specialTokens = specialTokens;
    this.specialTokenIds = new Map(specialTokens.map((x) => [x.id, x]));
    this.normalizer = normalizer;
    this.preTokenizer = preTokenizer;
    this.decoder = decoder;
    this.tokenToIds = new Map(vocab.map((x, i) => [this.normalize(x[0]), i]));
    this.bosToken = this.normalize(" ");
    this.bosTokenId = this.getTokenId(this.bosToken);
    this.eosToken = "</s>";
    this.eosTokenId = this.getTokenId(this.eosToken);
    this.unkToken = this.vocab[this.unkTokenId][0];
    this.trie = new CharTrie();
    this.minScore = 1.0e6;
    vocab.forEach((x) => (this.minScore = Math.min(this.minScore, x[1])));
    this.unkScore = this.minScore - 10.0;
    vocab[unkTokenId][1] = this.unkScore;
    vocab.forEach((x) => this.trie.push(x[0]));
  }
  static fromConfig(config) {
    const preTokenizer = TokenProcessor.fromConfig(config.pre_tokenizer);
    const normalizer = TokenProcessor.fromConfig(config.normalizer);
    const decoder = TokenProcessor.fromConfig(config.decoder);
    return new Tokenizer(
      config.model.vocab,
      config.model.unk_id,
      config.added_tokens,
      normalizer,
      preTokenizer,
      decoder
    );
  }

  getTokenId(normalizedToken) {
    return this.tokenToIds.get(normalizedToken);
  }

  normalize(text) {
    return this.normalizer.normalize(text);
  }

  preTokenize(normalized) {
    return this.preTokenizer.preTokenize(normalized);
  }

  populateNodes(lattice) {
    const sentence = lattice.sentence;
    const len = sentence.length;
    let beginPos = 0;
    while (beginPos < len) {
      const mblen = 1;
      let hasSingleNode = false;
      const tokens = [];
      for (let token of this.trie.commonPrefixSearch(
        sentence.slice(beginPos)
      )) {
        tokens.push(token);
        const tokenId = this.getTokenId(token);
        const tokenScore = this.vocab[tokenId][1];
        const n = token.length;
        lattice.insert(beginPos, n, tokenScore, tokenId);
        if (!hasSingleNode && n == mblen) {
          hasSingleNode = true;
        }
      }
      if (!hasSingleNode) {
        lattice.insert(beginPos, mblen, this.unkScore, this.unkTokenId);
      }
      beginPos += mblen;
    }
  }

  tokenize(normalized) {
    const lattice = new TokenLattice(
      normalized,
      this.bosTokenId,
      this.eosTokenId
    );
    this.populateNodes(lattice);
    const tokenIds = lattice.tokenIds();
    return tokenIds;
  }

  encode(text) {
    if (text === null || text === undefined || text.length === 0)
      return [this.eosTokenId];
    const normalized = this.normalize(text);
    const pre = this.preTokenize([normalized]);
    const tokens = [];
    for (let token of pre) {
      const tokenized = this.tokenize(token);
      tokens.push(...tokenized);
    }
    tokens.push(this.eosTokenId);
    return tokens;
  }

  decode(tokenIds, skipSpecialTokens) {
    const tokens = tokenIds.map((x) => {
      if (this.specialTokenIds.get(x) !== undefined && skipSpecialTokens) {
        return "";
      } else if (x == this.unkTokenId) {
        return this.unkToken + " ";
      } else if (x in this.vocab) {
        return this.vocab[x][0];
      } else {
        return `[${x}]`;
      }
    });
    const decodedTokens = this.decoder.decodeChain(tokens);
    const decoded = decodedTokens.join("");
    return decoded;
  }
}

export default Tokenizer;

class CharTrie {
  constructor() {
    this.root = CharTrieNode.default();
  }
  push(text) {
    let node = this.root;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      let child = node.children.get(ch);
      if (child === undefined) {
        child = CharTrieNode.default();
        node.children.set(ch, child);
      }
      node = child;
    }
    node.isLeaf = true;
  }
  *commonPrefixSearch(text) {
    let node = this.root;
    let prefix = "";
    for (let i = 0; i < text.length && node !== undefined; i++) {
      const ch = text[i];
      prefix += ch;
      node = node.children.get(ch);
      if (node !== undefined && node.isLeaf) {
        yield prefix;
      }
    }
  }
}

class CharTrieNode {
  constructor(isLeaf, children) {
    this.isLeaf = isLeaf;
    this.children = children;
  }
  static default() {
    return new CharTrieNode(false, new Map());
  }
}

class TokenLattice {
  constructor(sentence, bosTokenId, eosTokenId) {
    this.sentence = sentence;
    this.len = sentence.length;
    this.bosTokenId = bosTokenId;
    this.eosTokenId = eosTokenId;
    this.nodes = [];
    this.beginNodes = new Array(this.len + 1);
    this.endNodes = new Array(this.len + 1);
    for (let i = 0; i < this.len + 1; i++) {
      this.beginNodes[i] = [];
      this.endNodes[i] = [];
    }
    const bos = new TokenLatticeNode(this.bosTokenId, 0, 0, 0, 0.0);
    const eos = new TokenLatticeNode(this.eosTokenId, 1, this.len, 0, 0.0);
    this.nodes.push(bos.clone());
    this.nodes.push(eos.clone());
    this.beginNodes[this.len].push(eos);
    this.endNodes[0].push(bos);
  }

  insert(pos, length, score, tokenId) {
    const nodeId = this.nodes.length;
    const node = new TokenLatticeNode(tokenId, nodeId, pos, length, score);
    this.beginNodes[pos].push(node);
    this.endNodes[pos + length].push(node);
    this.nodes.push(node);
  }

  viterbi() {
    const len = this.len;
    let pos = 0;
    while (pos <= len) {
      if (this.beginNodes[pos].length == 0) {
        return [];
      }
      for (let rnode of this.beginNodes[pos]) {
        rnode.prev = null;
        let bestScore = 0.0;
        let bestNode = null;
        for (let lnode of this.endNodes[pos]) {
          const score = lnode.backtraceScore + rnode.score;
          if (bestNode === null || score > bestScore) {
            bestNode = lnode.clone();
            bestScore = score;
          }
        }
        if (bestNode !== null) {
          rnode.prev = bestNode;
          rnode.backtraceScore = bestScore;
        } else {
          return [];
        }
      }
      pos++;
    }
    const results = [];
    const root = this.beginNodes[len][0];
    const prev = root.prev;
    if (prev === null) {
      return [];
    }
    let node = prev.clone();
    while (node.prev !== null) {
      results.push(node.clone());
      const n = node.clone();
      node = n.prev.clone();
    }
    results.reverse();
    return results;
  }

  piece(node) {
    return this.sentence.slice(node.pos, node.pos + node.length);
  }

  tokens() {
    const nodes = this.viterbi();
    return nodes.map((x) => this.piece(x));
  }

  tokenIds() {
    const nodes = this.viterbi();
    return nodes.map((x) => x.tokenId);
  }
}

class TokenLatticeNode {
  constructor(tokenId, nodeId, pos, length, score) {
    this.tokenId = tokenId;
    this.nodeId = nodeId;
    this.pos = pos;
    this.length = length;
    this.score = score;
    this.prev = null;
    this.backtraceScore = 0.0;
  }

  clone() {
    const n = new TokenLatticeNode(
      this.tokenId,
      this.nodeId,
      this.pos,
      this.length,
      this.score
    );
    n.prev = this.prev;
    n.backtraceScore = this.backtraceScore;
    return n;
  }
}

class TokenProcessor {
  static fromConfig(config) {
    switch (config.type) {
      case "Metaspace":
        return new MetaspaceTokenProcessor(
          config.add_prefix_space,
          config.replacement,
          config.str_rep
        );
      case "Precompiled":
        return new PrecompiledTokenProcessor(config.precompiled_charsmap);
      case "Sequence":
        return new SequenceTokenProcessor(
          config.pretokenizers.map((x) => TokenProcessor.fromConfig(x))
        );
      case "WhitespaceSplit":
        return new WhitespaceSplitTokenProcessor();
      default:
        throw new Error("Unknown token processor type: " + config.type);
    }
  }
}

class MetaspaceTokenProcessor extends TokenProcessor {
  constructor(add_prefix_space, replacement, str_rep) {
    super();
    this.addPrefixSpace = add_prefix_space;
    this.replacement = replacement;
    this.strRep = str_rep || this.replacement;
  }

  preTokenize(normalizedTokens) {
    const result = [];
    for (let token of normalizedTokens) {
      let normalized = token.replace(" ", this.strRep);
      if (this.addPrefixSpace && !normalized.startsWith(this.replacement)) {
        normalized = this.strRep + normalized;
      }
      result.push(normalized);
    }
    return result;
  }

  decodeChain(tokens) {
    const result = [];
    let i = 0;
    for (let token of tokens) {
      let normalized = token.replace(this.replacement, " ");
      if (this.addPrefixSpace && i == 0 && normalized.startsWith(" ")) {
        normalized = normalized.substring(1);
      }
      result.push(normalized);
      i++;
    }
    return result;
  }
}

class PrecompiledTokenProcessor extends TokenProcessor {
  constructor(charsmap) {
    super();
    this.charsmap = charsmap;
  }

  normalize(text) {
    return text;
  }
}

class SequenceTokenProcessor extends TokenProcessor {
  constructor(tokenizers) {
    super();
    this.tokenizers = tokenizers;
  }

  preTokenize(normalizedTokens) {
    let result = normalizedTokens;
    for (let tokenizer of this.tokenizers) {
      result = tokenizer.preTokenize(result);
    }
    return result;
  }
}

class WhitespaceSplitTokenProcessor extends TokenProcessor {
  preTokenize(normalizedTokens) {
    const result = [];
    for (let token of normalizedTokens) {
      result.push(...token.split(/\s+/));
    }
    return result;
  }
}
