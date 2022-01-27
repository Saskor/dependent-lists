import { makeAutoObservable } from "mobx";
import { HEADERS } from "../constants/constants";

type Headers = typeof HEADERS[number]

type ParsedStringObject = { [key in Headers]: string }

export type ObjectWithDependenciesItem = {
  label: string;
  value: string;
  dependencyLink?: string;
}

export type DependencyLists = {
  [key: string]: Array<ObjectWithDependenciesItem> | undefined
}

class Share {

  constructor() {
    makeAutoObservable(this);
  }

  public getProperty = (obj: any, prop: string): any => prop.split("/").reduce(
    (acc, item) => {
      if (acc && typeof acc === "object") {
        return acc[item];
      }

      return null;
    },
    obj
  )

  public assignByPath = (obj: any, path: string, value: any): any => {
    const keyPath = path.split("/");
    const lastKeyIndex = keyPath.length - 1;
    for (let i = 0; i < lastKeyIndex; ++i) {
      const key = keyPath[i];
      if (!(key in obj)) {
        obj[key] = {};
      }
      // eslint-disable-next-line no-param-reassign
      obj = obj[key];
    }
    obj[keyPath[lastKeyIndex]] = value;

    return obj;
  }
}

export const ShareService = new Share();
export type ShareServiceType = typeof ShareService;
