import {
  Accordion,
  Button,
  Checkbox,
  Group,
  Modal,
  Stack,
  Stepper,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { IconList } from "@tabler/icons";
import { Field, Form, Formik } from "formik";
import merge from "lodash.merge";
import React, { useState } from "react";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { trpc } from "../lib/trpc";
import { formObject } from "../lib/validation";
import { HeaderCellIcon } from "./HeaderCell";

interface NewFormModalProps {
  tableId: string;
}

export const NewFormModal: React.FC<NewFormModalProps> = ({ tableId }) => {
  const { data: columns } = trpc.useQuery(["columns.byTableId", { tableId }]);
  const { data: form } = trpc.useQuery(["forms.byTableId", { tableId }]);
  const createForm = trpc.useMutation(["forms.create"]);
  const updateForm = trpc.useMutation(["forms.update"]);
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(0);
  const utils = trpc.useContext();
  const clipboard = useClipboard({ timeout: 500 });

  trpc.useSubscription(["forms.onCreate", { tableId }], {
    onNext(data) {
      utils.setQueryData(["forms.byTableId", { tableId }], data as any);
    },
  });

  trpc.useSubscription(["forms.onUpdate", { tableId }], {
    onNext(data) {
      utils.setQueryData(
        ["forms.byTableId", { tableId }],
        (old) => merge(old, data) as any
      );
    },
  });

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={form ? "" : "Create new form"}
        size="lg"
      >
        {form && (
          <TextInput
            pb={36}
            sx={(theme) => ({
              borderBottom: "1px solid",
              borderColor: theme.colors.dark[5],
            })}
            label="Shareable Link"
            description="Send this link to anyone for them to fill out the form"
            value={`${process.env.NEXT_PUBLIC_APP_URL}/forms/${form?.tableId}`}
            rightSectionWidth={clipboard.copied ? 76 : 64}
            rightSection={
              <Button
                compact
                color="dark"
                onClick={() =>
                  clipboard.copy(
                    `${process.env.NEXT_PUBLIC_APP_URL}/forms/${form?.tableId}`
                  )
                }
              >
                {clipboard.copied ? "Copied" : "Copy"}
              </Button>
            }
            readOnly
          />
        )}
        <Formik
          validationSchema={toFormikValidationSchema(formObject)}
          initialValues={{
            name: "",
            description: "",
            authenticatedOnly: false,
            singleSubmissionOnly: false,
            tableId,
            fields: (columns || []).map(({ id, name }) => ({
              id,
              columnId: id,
              label: name,
              description: "",
              required: false,
            })),
            ...(form || {}),
          }}
          onSubmit={async (values) => {
            if (!form) {
              delete values.id;
              await createForm.mutateAsync(values);
            } else {
              await updateForm.mutateAsync(values);
            }
          }}
          enableReinitialize
        >
          {({ values, submitForm, isSubmitting, errors }) => (
            <Form>
              <Stepper
                active={active}
                onStepClick={setActive}
                breakpoint="sm"
                mt={form ? 36 : 0}
              >
                <Stepper.Step
                  label="First step"
                  description="Enter information"
                >
                  <Stack>
                    <Field
                      name="name"
                      as={TextInput}
                      placeholder="Form name"
                      label="Form name"
                      error={errors.name}
                      required
                    />
                    <Field
                      name="description"
                      as={Textarea}
                      placeholder="Form description"
                      label="Form description"
                      error={errors.description}
                      required
                    />
                    <Field
                      name="authenticatedOnly"
                      as={Checkbox}
                      checked={values.authenticatedOnly}
                      label="Authenticated submissions only"
                    />
                    <Tooltip
                      label={
                        values.authenticatedOnly
                          ? "NOTE: After deleting a user-submitted row, they can submit another response"
                          : "Enable authenticated submissions only"
                      }
                      placement="start"
                      width="auto"
                      withArrow
                    >
                      <Field
                        name="singleSubmissionOnly"
                        as={Checkbox}
                        checked={values.singleSubmissionOnly}
                        label="Restrict submissions to one per user"
                        disabled={!values.authenticatedOnly}
                      />
                    </Tooltip>
                  </Stack>
                </Stepper.Step>
                <Stepper.Step
                  label="Second step"
                  description="Submission options"
                >
                  <Accordion iconPosition="right">
                    {columns?.map((column, index) => {
                      const error: any = errors.fields?.[index];
                      return (
                        <Accordion.Item
                          key={column.id}
                          label={
                            <Group spacing={8}>
                              <HeaderCellIcon type={column.type} />
                              <Text>{column.name}</Text>
                            </Group>
                          }
                        >
                          <Stack>
                            <Field
                              as={TextInput}
                              name={`fields[${index}].label`}
                              error={error?.label}
                              placeholder="Label"
                              label="Label"
                              required
                            />
                            <Field
                              as={Textarea}
                              name={`fields[${index}].description`}
                              error={error?.description}
                              placeholder="Description"
                              label="Description"
                            />
                            <Field
                              as={Checkbox}
                              name={`fields[${index}].required`}
                              label="Required"
                            />
                          </Stack>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                  {!form && (
                    <Button
                      loading={isSubmitting}
                      color="dark"
                      mt="md"
                      onClick={submitForm}
                      fullWidth
                    >
                      Create Form
                    </Button>
                  )}
                </Stepper.Step>
                <Stepper.Completed>
                  Completed, click back button to get to previous step
                </Stepper.Completed>
              </Stepper>
              {form && (
                <Button
                  loading={isSubmitting}
                  color="dark"
                  mt="md"
                  onClick={submitForm}
                  fullWidth
                >
                  Update Form
                </Button>
              )}
            </Form>
          )}
        </Formik>
      </Modal>
      <Button
        compact
        variant="outline"
        leftIcon={<IconList size={16} />}
        onClick={() => setOpened(true)}
        color="blue"
      >
        Form
      </Button>
    </>
  );
};
