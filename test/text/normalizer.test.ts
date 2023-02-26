import { NewNormalizer, NormalizerConfig } from "../../src/text/tokenizers/normalizer";

test("NFD normalizer", () => {
  const config = { type: "nfd" };
  const normalizer = NewNormalizer(config);
  expect(normalizer.process("a\u0300")).toEqual("à".normalize("NFD"));
  expect(normalizer.process("a\u0300b\u0301")).toEqual("àb́".normalize("NFD"));
});

test("NFKD normalizer", () => {
  const config = { type: "nfkd" };
  const normalizer = NewNormalizer(config);
  expect(normalizer.process("a\u0300")).toEqual("à".normalize("NFKD"));
  expect(normalizer.process("a\u0300b\u0301")).toEqual("àb́".normalize("NFKD"));
});

test("Replace normalizer", () => {
  let config: NormalizerConfig = {
    type: "replace",
    replace: {
      string: "''",
      replacement: '"',
    },
  };
  let normalizer = NewNormalizer(config);
  expect(normalizer.process("This is a ''test''")).toEqual('This is a "test"');
  config = {
    type: "replace",
    replace: {
      regex: "\\s+",
      replacement: " ",
    },
  };
  normalizer = NewNormalizer(config);
  expect(normalizer.process("This     is   a         test")).toEqual("This is a test");
});

test("BERT normalizer", () => {
  const config = {
    type: "bertnormalizer",
    cleanText: true,
    lowercase: true,
    stripAccents: true,
  };
  const normalizer = NewNormalizer(config);
  expect(normalizer.process("\u007FThis is\nà test")).toEqual("this is a test");
});
