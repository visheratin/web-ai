import {
  BertPreTokenizer,
  ByteLevel,
  Metaspace,
  Punctuation,
  Whitespace,
} from "../../src/text/tokenizers/preTokenizer";

test("Whitespace preTokenizer", () => {
  const preTokenizer = new Whitespace({
    type: "Whitespace",
  });
  const str = "Hello, world!";
  const tokens = preTokenizer.process(str);
  expect(tokens).toEqual(["Hello", ",", "world", "!"]);
});

test("Punctuation preTokenizer", () => {
  const preTokenizer = new Punctuation({
    type: "Punctuation",
  });
  const str = "Hello, world!?";
  const tokens = preTokenizer.process(str);
  expect(tokens).toEqual(["Hello", ",", " world", "!", "?"]);
});

test("Bert preTokenizer", () => {
  const preTokenizer = new BertPreTokenizer({
    type: "BertPreTokenizer",
  });
  const str = "Hello, world!!";
  const tokens = preTokenizer.process(str);
  expect(tokens).toEqual(["Hello", ",", "world", "!!"]);
});

test("Metaspace preTokenizer", () => {
  const preTokenizer = new Metaspace({
    type: "Metaspace",
    replacement: "_",
    addPrefixSpace: true,
  });
  const str = "Hey   friend!";
  const tokens = preTokenizer.process(str);
  expect(tokens).toEqual(["_Hey", "_", "_", "_friend!"]);
});

test("ByteLevel preTokenizer", () => {
  const preTokenizer = new ByteLevel({
    type: "ByteLevel",
    addPrefixSpace: true,
  });
  const str = "Hey friend!";
  const tokens = preTokenizer.process(str);
  expect(tokens).toEqual([" Hey", " friend", "!"]);
});
