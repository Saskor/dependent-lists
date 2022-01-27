import { makeAutoObservable } from "mobx";
import {
  HEADERS,
  ITEMS
} from "../constants/constants";
import {
  PrepareDataServiceType,
  PrepareDataService as PrepareData
} from "./PrepareDataService";
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

export type DependencyLists = {
  [key: string]: Array<ObjectWithDependenciesItem> | undefined
}

class FormDataModel {
  public dependenciesData: {
    bankingType: {items: Array<ObjectWithDependenciesItem>}
  } = {
    bankingType: { items: [] }
  };

  public dependencyLists: DependencyLists = {
    bankingType: undefined,
    serviceType: undefined,
    serviceInfoType: undefined,
    serviceInfo: undefined
  }

  constructor(
    private PrepareDataService: PrepareDataServiceType,
    private ShareService: ShareServiceType
  ) {
    makeAutoObservable(this);
  }

  public setIndependentListOptions = (): void => {
    const {
      [HEADERS[0]]: {
        items: bankingTypeItems = undefined
      } = {}
    } = this.dependenciesData;

    this.dependencyLists.bankingType = bankingTypeItems;
  };

  public setNextDependentListOptions = (
    childListName: string,
    currentListValue: ObjectWithDependenciesItem | null
  ): void => {

    const dependencyLink = currentListValue?.dependencyLink || "";
    const listOptions = this.ShareService.getProperty(
      this.dependenciesData,
      dependencyLink
    )[ITEMS];

    this.dependencyLists[childListName] = listOptions || undefined;
  };

  public init = (data: Array<string>): void => {
    this.dependenciesData = this.PrepareDataService.getData(data);
    this.setIndependentListOptions();
  }
}

export const FormDataService = new FormDataModel(PrepareData, Share);
export type FormDataServiceType = typeof FormDataService;
