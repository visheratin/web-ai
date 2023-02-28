export class Trie {
  private readonly root: TrieNode;

  constructor() {
    this.root = new TrieNode(false, new Map());
  }

  push(text: string) {
    let node = this.root;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      let child = node.children.get(ch);
      if (child === undefined) {
        child = new TrieNode(false, new Map());
        node.children.set(ch, child);
      }
      node = child;
    }
    node.isLeaf = true;
  }

  *commonPrefixSearch(text: string) {
    let node: TrieNode | undefined = this.root;
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

class TrieNode {
  isLeaf: boolean;
  children: Map<string, TrieNode>;

  constructor(isLeaf: boolean, children: Map<string, TrieNode>) {
    this.isLeaf = isLeaf;
    this.children = children;
  }
}
