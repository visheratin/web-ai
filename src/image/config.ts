/**
 * Configuration for the image model.
 *
 * @param classes - map where keys are class IDs and values are class names.
 * @param colors - map where keys are class IDs and values are class colors.
 *
 * @remarks
 * If the colors are not present in the config file, they will be randomly
 * populated during the configuration creation.
 */
export class Config {
  classes: Map<number, string>;
  colors: Map<number, number[]>;

  constructor() {
    this.classes = new Map<number, string>();
    this.colors = new Map<number, number[]>();
  }

  /**
   * Reads the configuration from the file.
   *
   * @param configPath - URL to the configuration file.
   *
   * @returns configuration for the image model.
   */
  static fromFile = async (configPath: string): Promise<Config> => {
    const configData = await fetch(configPath).then((resp) => resp.json());
    const config = this.parseConfig(configData);
    config.validate();
    return config;
  };

  /**
   * Parses the configuration from the JSON data.
   *
   * @param configData - JSON data read from the configuration file.
   *
   * @returns configuration for the image model.
   */
  static parseConfig = (configData: any): Config => {
    const res = new Config();
    for (const [idxString, className] of Object.entries(
      configData["id2label"]
    )) {
      const idx = Number(idxString);
      res.classes.set(idx, className as string);
      if ("colors" in configData && idxString in configData["colors"]) {
        const color = configData["colors"][idxString];
        res.colors.set(idx, color);
      } else {
        const r = Math.round(Math.random() * 256);
        const g = Math.round(Math.random() * 256);
        const b = Math.round(Math.random() * 256);
        res.colors.set(idx, [r, g, b]);
      }
    }
    return res;
  };

  /**
   * Checks the configuration for correctness. Throws an error if the configuration is not valid.
   */
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

export default Config;
