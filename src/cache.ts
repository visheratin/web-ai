import localforage from "localforage";

export const InitCache = async () => {
  localforage.config({
    name: "Web-AI",
    version: 1.0,
    driver: localforage.INDEXEDDB,
    size: 500000000, // 500 MB cache size
    storeName: "model_storage",
  });
};
