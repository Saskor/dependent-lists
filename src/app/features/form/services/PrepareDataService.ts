import { makeAutoObservable } from "mobx";
import {
  HEADERS,
  ITEMS,
  LABEL,
  CREATE_DEPENDENCIES_UP_TO_INDEX
} from "../constants/constants";
import {
  ShareServiceType,
  ShareService as Share
} from "./ShareService";

type Headers = typeof HEADERS[number]

type ParsedStringObject = { [key in Headers]: string }

export type ObjectWithDependenciesItem = {
  label: string;
  value: string;
  dependencyLink?: string;
}

type ObjectWithDependencies = { items: Array<ObjectWithDependenciesItem> }

export type DependencyLists = {
  [key: string]: Array<ObjectWithDependenciesItem> | undefined
}

class PrepareData {
  constructor(private ShareService: ShareServiceType) {
    makeAutoObservable(this);
  }

  private reduceStringsToObjectsByHeaders = (
    arrOfStrings: Array<string>
  ): Array<ParsedStringObject> => (arrOfStrings.map(item => {
    const splitItem: Array<string> = item.split(/\|/);

    return splitItem.reduce((
      acc,
      splitStringItem: string,
      index
    ): ParsedStringObject => ({
      ...acc,
      [HEADERS[index]]: splitStringItem
    }),
      {} as ParsedStringObject);
  }))

  private equal = (
    label: string,
    parsedStringObjectPart: string | undefined
  ): boolean => (
    label === parsedStringObjectPart
  )

  private parsedStringObjectPartIsUnique = (
    items: Array<ObjectWithDependenciesItem>,
    parsedStringObject: ParsedStringObject,
    headersItem: Headers
  ): boolean => items.every(
    (item: ObjectWithDependenciesItem) => !this.equal(
      item[LABEL],
      parsedStringObject[headersItem]
    )
  )

  private getDependencyPathStart = (dependencyPath: string): string => (
    dependencyPath ? `${dependencyPath}/` : `${HEADERS[0]}/`
  )

  private getDependencyPathEnd = (
    headersIndex: number,
    parsedStringObjectIndex: number
  ): string => {
    const headersNextItemIndex = headersIndex + 1;
    const headersNextItem = HEADERS[headersNextItemIndex];

    // parsedStringObjectIndex + headersNextItemIndex  is unique id for dependencyPath
    return `${headersNextItem}_${parsedStringObjectIndex}_${headersNextItemIndex}`;
  }

  private getDependencyLink = (
    dependencyPath: string,
    headersIndex: number,
    parsedStringObjectIndex: number
  ) => (
    `${
      dependencyPath || HEADERS[0]
    }/${
      this.getDependencyPathEnd(headersIndex, parsedStringObjectIndex)
    }`
  )

  private getNextDependencyPath = (
    dependencyPath: string,
    headersIndex: number,
    parsedStringObjectIndex: number
  ) => (
    `${
      this.getDependencyPathStart(dependencyPath)
    }${
      this.getDependencyPathEnd(headersIndex, parsedStringObjectIndex)
    }`
  )

  private getDependencyPathFromItem = (
    items: Array<ObjectWithDependenciesItem>,
    parsedStringObject: ParsedStringObject,
    headersItem: Headers
  ): string => {
    let dependencyLink = "";

    for (let i = 0; i < items.length; i++) {
      if (this.equal(
        items[i][LABEL],
        parsedStringObject[headersItem]
      )) {
        dependencyLink = items[i].dependencyLink || "";
      }
      continue;
    }

    return dependencyLink;
  }

  private getItemsByPath = (
    objectWithDependencies: ObjectWithDependencies,
    path: string
  ): Array<ObjectWithDependenciesItem> => {
    const objectWithDependenciesByPath: ObjectWithDependencies
      = this.ShareService.getProperty(objectWithDependencies, path);

    return this.ShareService.getProperty(
      objectWithDependenciesByPath,
      ITEMS
    ) || [];
  }

  private reduceHeadersObjectsCallback = (
    objectWithDependencies: any,
    parsedStringObject: ParsedStringObject,
    parsedStringObjectIndex: number
  ): any => {
    let dependencyPath: string;
    HEADERS.forEach((headersItem, headersIndex) => {
      if (headersIndex < CREATE_DEPENDENCIES_UP_TO_INDEX) {
        const path = dependencyPath || headersItem;
        const items = this.getItemsByPath(objectWithDependencies, path);
        const parsedStringObjectPartIsUnique = items.length
          ? this.parsedStringObjectPartIsUnique(
            items,
            parsedStringObject,
            headersItem
          )
          : true;

        if (!parsedStringObjectPartIsUnique) {
          dependencyPath = this.getDependencyPathFromItem(
            items,
            parsedStringObject,
            headersItem
          );
        }

        // part of parsed string is unique if compare it with the same part of previous strings
        if (parsedStringObjectPartIsUnique) {
          const dependencyLink = this.getDependencyLink(
            dependencyPath,
            headersIndex,
            parsedStringObjectIndex
          );
          const newItems = [
            ...items,
            {
              label: parsedStringObject[headersItem],
              value: parsedStringObject[headersItem],
              ...(dependencyLink && { dependencyLink })
            }
          ];

          this.ShareService.assignByPath(
            objectWithDependencies,
            `${path}/${ITEMS}`,
            newItems
          );

          // set dependencyPath for the next iteration over the HEADERS
          dependencyPath = this.getNextDependencyPath(
            dependencyPath,
            headersIndex,
            parsedStringObjectIndex
          );
        }
      }
    });

    return objectWithDependencies;
  }

  public getData = (data: Array<string>): {
    bankingType: {items: Array<ObjectWithDependenciesItem>}
  } => {
    const headersObjects = this.reduceStringsToObjectsByHeaders(data);

    return headersObjects.reduce(
      this.reduceHeadersObjectsCallback, {}
    );
  }
}

export const PrepareDataService = new PrepareData(Share);
export type PrepareDataServiceType = typeof PrepareDataService;
