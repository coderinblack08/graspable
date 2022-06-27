import { Loader } from "@mantine/core";
import { useFormikContext } from "formik";
import debounce from "lodash.debounce";
import React, { useCallback, useEffect, useState } from "react";

export const AutoSave: React.FC = () => {
  const formik = useFormikContext();
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSubmit = useCallback(
    debounce(() => formik.submitForm().then(() => setIsLoading(false)), 500),
    [formik.submitForm, formik.isValid, formik.initialValues, formik.values]
  );

  useEffect(() => {
    if (formik.isValid && formik.dirty) {
      setIsLoading(true);
      debouncedSubmit();
    }
    return debouncedSubmit.cancel;
  }, [debouncedSubmit, formik.dirty, formik.isValid, formik.values]);

  return isLoading ? (
    <Loader sx={{ flexShrink: 0 }} ml={8} size="xs" color="gray" />
  ) : null;
};
