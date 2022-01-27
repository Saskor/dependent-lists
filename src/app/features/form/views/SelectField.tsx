import React, { ReactElement } from "react";
import { useField } from "formik";
import Select from "react-select";
import { ObjectWithDependenciesItem } from "../services";

type SelectFieldProps = {
  label: string;
  options: Array<ObjectWithDependenciesItem> | undefined;
  name: string;
  validate?: (value: any) => string | Promise<string> | undefined;
  disabled: boolean;
  onFieldChange: (
    value: ObjectWithDependenciesItem,
    setValue: (value: any, shouldValidate?: (boolean | undefined)) => void
  ) => void;
}

export const SelectField = (
  {
    name,
    label,
    options,
    disabled,
    onFieldChange
  }: SelectFieldProps
): ReactElement => {
  const [ field, meta, { setValue, setTouched } ] = useField(name);

  const onBlur = React.useCallback(
    () => setTouched(true),
    [ setTouched ]
  );

  const onChange = React.useCallback(
    value => {
      onFieldChange(value, setValue);
    },
    [ setValue ]
  );


  return (
    <div>
      <label>
        {label}
        <Select
          value={field.value}
          onChange={onChange}
          onBlur={onBlur}
          options={options}
          isDisabled={disabled}
          menuPortalTarget={document.getElementById("portal-root")}
          menuPlacement="bottom"
          menuPosition="fixed"
        />
      </label>
      {meta.touched && meta.error ? (
        <div className="error">{meta.error}</div>
      ) : null}
    </div>
  );
};
