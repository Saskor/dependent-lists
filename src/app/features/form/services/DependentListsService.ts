import { makeAutoObservable } from "mobx";
import { FormikHelpers, FormikValues } from "formik";
import { LISTS_NAMES } from "../constants/constants";

class DependentLists {
  constructor() {
    makeAutoObservable(this);
  }

  public getParentListValue = (currentListIndex: number, formValues: any) => {
    const parentListIndex = currentListIndex - 1;
    const parentListName = LISTS_NAMES[parentListIndex];

    const { value = null } = formValues[parentListName] || {};

    return !value;
  }

  public clearNextDependentListsValues = (
    dependentListsNames: Array<string>,
    setFieldValue: FormikHelpers<FormikValues>["setFieldValue"]
  ): void => {
    dependentListsNames.forEach(
      dependentListName => setFieldValue(
        dependentListName,
        { label: "", value: "" },
        false
      )
    );
  }
}

export const DependentListsService = new DependentLists();
export type DependentListsServiceType = typeof DependentListsService;
