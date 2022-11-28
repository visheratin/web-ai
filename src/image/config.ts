export class Config {
  classes: Map<number, string>;
  colors: Map<number, number[]>;

  constructor() {
    this.classes = new Map<number, string>();
    this.colors = new Map<number, number[]>();
  }

  static fromFile = async (configPath: string): Promise<Config> => {
    const configData = await fetch(configPath).then((resp) => resp.json());
    const config = this.parseConfig(configData);
    config.validate();
    return config;
  };

  static parseConfig = (configData): Config => {
    let res = new Config();
    for (const [idxString, className] of Object.entries(
      configData["id2label"]
    )) {
      const idx = Number(idxString);
      res.classes.set(idx, className as string);
      if ("colors" in configData && idxString in configData["colors"]) {
        const color = configData["colors"][idxString];
        res.colors.set(idx, color);
      } else {
        const hexColor = Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0");
        const color = convertToRGB(hexColor);
        res.colors.set(idx, color);
      }
    }
    return res;
  };

  validate = () => {
    if (this.colors && this.classes && this.classes.size != this.colors.size) {
      throw new Error("lengths of classes and colors do not match");
    }
    this.classes.forEach(
      (value: string, key: number, _: Map<number, string>) => {
        if (this.colors && !this.colors.has(key)) {
          throw new Error(
            `class ${value} (code ${key}) is not present in colors`
          );
        }
      }
    );
  };
}

const convertToRGB = (hexColor: string): number[] => {
  hexColor = hexColor.replace("#", "");
  const rgbValue = hexColor.match(/.{1,2}/g);
  if (rgbValue === null || rgbValue.length != 3) {
    throw new Error(`invalid hex color: ${hexColor}`);
  }
  const result = [
    parseInt(rgbValue[0], 16),
    parseInt(rgbValue[1], 16),
    parseInt(rgbValue[2], 16),
  ];
  return result;
};

export default Config;
