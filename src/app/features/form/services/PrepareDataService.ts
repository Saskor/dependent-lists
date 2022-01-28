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

  private createUniqueDependencyPath = (
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

  private getNotUniqueParsedStringObjectPartIndex = (
    items: Array<ObjectWithDependenciesItem>,
    parsedStringObject: ParsedStringObject,
    headersItem: Headers
  ): number => {

    for (let i = 0; i < items.length; i++) {
      if (this.equal(
        items[i][LABEL],
        parsedStringObject[headersItem]
      )) {
        return i;
      }
    }

    return -1;
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
        const itemsByPath = this.getItemsByPath(objectWithDependencies, path);

        const notUniqueParsedStringObjectPartIndex
          = this.getNotUniqueParsedStringObjectPartIndex(
            itemsByPath,
            parsedStringObject,
            headersItem
          );

        const parsedStringObjectPartIsUnique = itemsByPath.length
          ? notUniqueParsedStringObjectPartIndex > -1
          : true;

        // part of parsed string is unique if compare it with the same part of previous strings
        if (parsedStringObjectPartIsUnique) {
          const dependencyLink = this.createUniqueDependencyPath(
            dependencyPath,
            headersIndex,
            parsedStringObjectIndex
          );

          const newItems = [
            ...itemsByPath,
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
          dependencyPath = dependencyLink;
        } else {
          // set dependencyPath for the next iteration over the HEADERS
          dependencyPath
            = itemsByPath[notUniqueParsedStringObjectPartIndex].dependencyLink
          || "";
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
