interface DecoderConfig {
  type: string;
}

interface Decoder {
  config: DecoderConfig;

  decode(tokens: string[]): string;
}
