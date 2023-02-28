export class Lattice {
  readonly sentence: string;
  private nodes: LatticeNode[];
  private len: number;
  private bosTokenID: number;
  private eosTokenID: number;
  private beginNodes: LatticeNode[][];
  private endNodes: LatticeNode[][];

  constructor(sentence: string, bosTokenID: number, eosTokenID: number) {
    this.sentence = sentence;
    this.len = sentence.length;
    this.bosTokenID = bosTokenID;
    this.eosTokenID = eosTokenID;
    this.nodes = [];
    this.beginNodes = new Array(this.len + 1);
    this.endNodes = new Array(this.len + 1);
    for (let i = 0; i < this.len + 1; i++) {
      this.beginNodes[i] = [];
      this.endNodes[i] = [];
    }
    const bos = new LatticeNode(this.bosTokenID, 0, 0, 0, 0.0);
    const eos = new LatticeNode(this.eosTokenID, 1, this.len, 0, 0.0);
    this.nodes.push(bos.clone());
    this.nodes.push(eos.clone());
    this.beginNodes[this.len].push(eos);
    this.endNodes[0].push(bos);
  }

  insert(pos: number, length: number, score: number, tokenID: number) {
    const nodeId = this.nodes.length;
    const node = new LatticeNode(tokenID, nodeId, pos, length, score);
    this.beginNodes[pos].push(node);
    this.endNodes[pos + length].push(node);
    this.nodes.push(node);
  }

  viterbi(): LatticeNode[] {
    const len = this.len;
    let pos = 0;
    while (pos <= len) {
      if (this.beginNodes[pos].length == 0) {
        return [];
      }
      for (const rnode of this.beginNodes[pos]) {
        rnode.prev = null;
        let bestScore = 0.0;
        let bestNode: LatticeNode | null = null;
        for (const lnode of this.endNodes[pos]) {
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
    const results: LatticeNode[] = [];
    const root = this.beginNodes[len][0];
    const prev = root.prev;
    if (prev === null) {
      return [];
    }
    let node: LatticeNode | null = prev.clone();
    while (node !== null && node.prev !== null) {
      results.push(node.clone());
      const n = node.clone();
      node = n.prev !== null ? n.prev.clone() : null;
    }
    results.reverse();
    return results;
  }

  piece(node: LatticeNode): string {
    return this.sentence.slice(node.pos, node.pos + node.length);
  }

  tokens(): string[] {
    const nodes = this.viterbi();
    return nodes.map((x) => this.piece(x));
  }

  tokenIDs(): number[] {
    const nodes = this.viterbi();
    return nodes.map((x) => x.tokenId);
  }
}

class LatticeNode {
  readonly tokenId: number;
  readonly nodeId: number;
  readonly pos: number;
  readonly length: number;
  readonly score: number;
  prev: LatticeNode | null;
  backtraceScore: number;

  constructor(tokenID: number, nodeID: number, pos: number, length: number, score: number) {
    this.tokenId = tokenID;
    this.nodeId = nodeID;
    this.pos = pos;
    this.length = length;
    this.score = score;
    this.prev = null;
    this.backtraceScore = 0.0;
  }

  clone(): LatticeNode {
    const n = new LatticeNode(this.tokenId, this.nodeId, this.pos, this.length, this.score);
    n.prev = this.prev;
    n.backtraceScore = this.backtraceScore;
    return n;
  }
}
