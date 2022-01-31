import { observer } from "mobx-react";
import React, { useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { Formik } from "formik";
import { LISTS_NAMES, stringArr } from "../constants/constants";
import { FormDataServiceType, DependentListsService } from "../services";
import { DependentLists } from "./DependentLists";

export const Form = observer(
  ({ dataModel }: { dataModel: FormDataServiceType }) => {
    const { init, setNextDependentListOptions } = dataModel;

    useEffect(() => {
      init(stringArr);
    }, []);


    const onSubmit = useCallback((values, actions) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2));
        actions.setSubmitting(false);
      }, 1000);
    }, []);

    const initialValues = LISTS_NAMES.reduce(
      (acc, listName) => (
        { ...acc, [listName]: undefined }
      ),
      {}
    );

    return (
      <div>
        <h3>
          <Link to="/">Go to home page</Link>
        </h3>
        <div>
          <h1>My Form</h1>
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
          >
            {props => (
              <form onSubmit={props.handleSubmit}>
                <DependentLists
                  dependencyLists={dataModel.dependencyLists}
                  setFieldValue={props.setFieldValue}
                  formValues={props.values}
                  setNextDependentListOptions={setNextDependentListOptions}
                  DependentListsService={DependentListsService}
                />

                <button type="submit">Submit</button>
              </form>
            )}
          </Formik>
        </div>

      </div>
    );
  }
);
