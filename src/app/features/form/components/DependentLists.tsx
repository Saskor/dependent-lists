import { FormikHelpers, FormikValues } from "formik";
import React from "react";
import { LISTS_NAMES, LISTS_LABELS } from "../constants";
import { SelectField } from "../views/SelectField";
import {
  DependentListsServiceType,
  DependencyLists,
  ObjectWithDependenciesItem
} from "../services";

export const DependentLists = (
  {
    dependencyLists,
    setFieldValue,
    formValues,
    setNextDependentListOptions,
    DependentListsService
  }: {
    dependencyLists: DependencyLists,
    setFieldValue: FormikHelpers<FormikValues>["setFieldValue"],
    formValues: any,
    setNextDependentListOptions: (
      childListName: string,
      currentListValue: ObjectWithDependenciesItem | null
    ) => void,
    DependentListsService: DependentListsServiceType
  }
) => {
  const dependentLists = LISTS_NAMES.map(
    (listName: string, index: number, listNames) => {
      const label = LISTS_LABELS[index];
      const currentListIndependent = index === 0;
      const disabled = currentListIndependent
        ? false
        : DependentListsService.getParentListValue(index, formValues);
      const nextListIndex = index + 1;
      const listIsLast = index === LISTS_NAMES.length - 1;
      const dependentListsNames = listNames.slice(nextListIndex);

      const onFieldChange = React.useCallback((
        value: ObjectWithDependenciesItem,
        setValue: (value: any, shouldValidate?: (boolean | undefined)) => void
      ): void => {
        setValue(value, true);
        DependentListsService.clearNextDependentListsValues(
          dependentListsNames,
          setFieldValue
        );

        if (!listIsLast) {
          setNextDependentListOptions(dependentListsNames[0], value);
        }
      }, []);

      return (
        <SelectField
          key={label}
          label={label}
          options={dependencyLists[listName]}
          onFieldChange={onFieldChange}
          name={listName}
          disabled={disabled}
        />
      );
    }
  );

  return <React.Fragment>{dependentLists}</React.Fragment>;
};
