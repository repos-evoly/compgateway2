import React, { ReactNode } from "react";
import { Formik, FormikConfig, FormikHelpers, FormikValues } from "formik";

type PropsType<T extends FormikValues> = {
  initialValues: T; // Use a generic type for form data
  onSubmit: (
    values: T,
    formikHelpers: FormikHelpers<T>
  ) => void | Promise<void>;
  validationSchema?: FormikConfig<T>["validationSchema"];
  children: ReactNode; // Form fields and components
  enableReinitialize?: boolean; // To enable reinitializing form values
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLFormElement>,
    formikProps: FormikHelpers<T>
  ) => void;
};

const Form = <T extends FormikValues>({
  initialValues,
  onSubmit,
  validationSchema,
  children,
  enableReinitialize = false,
  onKeyDown,
}: PropsType<T>) => {
  return (
    <Formik<T>
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
      enableReinitialize={enableReinitialize}
    >
      {(formikProps) => (
        <form
          onSubmit={formikProps.handleSubmit}
          onKeyDown={(event) => onKeyDown && onKeyDown(event, formikProps)}
          className="w-full my-4" // Tailwind styling
        >
          {children}
        </form>
      )}
    </Formik>
  );
};

export default Form;
