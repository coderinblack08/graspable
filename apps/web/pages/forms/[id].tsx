import {
  AppShell,
  Avatar,
  Button,
  Center,
  Checkbox,
  Divider,
  Group,
  InputWrapper,
  Modal,
  NumberInput,
  Paper,
  Select,
  Space,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconExternalLink } from "@tabler/icons";
import { Field, Form, Formik, useField } from "formik";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { RichTextEditor } from "../../components/RichTextEditor";
import { InferQueryOutput, trpc } from "../../lib/trpc";

const FormInput: React.FC<{
  label: string;
  description?: string | null;
  required: boolean;
  column: InferQueryOutput<"columns.byTableId">[0];
}> = ({ column, label, description, required }) => {
  const [_, { value, error }, { setValue }] = useField(column.id);

  switch (column.type) {
    case "date":
      return (
        <DatePicker
          name={column.id}
          value={value}
          onChange={(v) => setValue(v)}
          label={label}
          error={error}
          placeholder="Date Input"
          description={description}
          dropdownType="modal"
          required={required}
        />
      );
    case "number":
      return (
        <NumberInput
          name={column.id}
          value={value}
          error={error}
          onChange={(v) => setValue(v)}
          label={label}
          placeholder="Number Input"
          description={description}
          required={required}
        />
      );
    case "richtext":
      return (
        <InputWrapper
          error={error}
          label={label}
          description={description}
          required={required}
        >
          <RichTextEditor value={value} onChange={(v) => setValue(v)} />
        </InputWrapper>
      );
    case "checkbox":
      return (
        <InputWrapper
          error={error}
          label={label}
          description={description}
          required={required}
        >
          <Checkbox
            checked={value ? (value === "true" ? true : false) : false}
            onChange={(e: any) => setValue(e.target.checked.toString())}
            name={column.id}
          />
        </InputWrapper>
      );
    case "dropdown":
      return (
        <Select
          value={value}
          error={error}
          onChange={(v) => setValue(v)}
          name={column.id}
          data={column.dropdownOptions.map((c) => ({
            label: c,
            value: c,
          }))}
          label={label}
          placeholder="Dropdown Input"
          description={description}
          required={required}
          clearable
          allowDeselect
        />
      );
    case "url":
      return (
        <Field
          error={error}
          as={TextInput}
          name={column.id}
          type="url"
          label={label}
          placeholder="URL Input"
          value={value || ""}
          description={description}
          required={required}
        />
      );
    default:
      return (
        <Field
          as={TextInput}
          name={column.id}
          label={label}
          error={error}
          placeholder="Text Input"
          value={value || ""}
          description={description}
          required={required}
        />
      );
  }
};

const FormPage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ id }) => {
  const theme = useMantineTheme();
  const [submitted, setSubmitted] = useState(false);
  const { data: session } = useSession();
  const { data: form } = trpc.useQuery(["forms.byTableId", { tableId: id }]);
  const submitForm = trpc.useMutation(["forms.submit"]);

  return (
    <AppShell sx={{ backgroundColor: theme.colors.dark[9], height: "100vh" }}>
      <Head>
        <title>Form: {form?.name}</title>
      </Head>
      {form?.authenticatedOnly && !session?.user ? (
        <Modal withCloseButton={false} onClose={() => {}} opened={true}>
          <Text>This form requires you to be logged in.</Text>
          <Link
            href={{
              pathname: "/auth/login",
              query: { redirect: `/forms/${encodeURIComponent(id)}` },
            }}
            passHref
          >
            <Button
              component="a"
              leftIcon={<IconExternalLink size={16} />}
              mt="md"
              compact
            >
              Log In
            </Button>
          </Link>
        </Modal>
      ) : null}
      <Center my={32}>
        <Stack align="center">
          <Paper sx={{ width: 580 }} shadow="md" p="lg" radius="md">
            <Title order={2}>{form?.name}</Title>
            <Text sx={{ fontSize: 16 }} color="dimmed">
              {form?.description}
            </Text>
            <Divider sx={{ borderColor: theme.colors.dark[5] }} mt="md" />
            <Space h="md" />
            <Formik
              initialValues={
                form?.fields.reduce(
                  (acc, f) => ({
                    ...acc,
                    [f.columnId]: f.Column.type === "checkbox" ? "false" : "",
                  }),
                  new Object()
                ) || {}
              }
              validate={(values: any) => {
                const errors: Record<string, string> = {};
                form?.fields.forEach((f) => {
                  if (f.required && !values[f.columnId]) {
                    errors[f.columnId] = "Required";
                  }
                });
                return errors;
              }}
              onSubmit={async (values) => {
                if (form) {
                  await submitForm.mutateAsync(
                    {
                      formId: form.id,
                      data: values,
                    },
                    {
                      onSuccess: () => {
                        showNotification({
                          color: "green",
                          title: "Success",
                          message: "Your submission has been saved",
                        });
                        setSubmitted(true);
                      },
                      onError: (error) => {
                        if (error.data?.code === "CONFLICT") {
                          showNotification({
                            color: "red",
                            title: "Error",
                            message: "You already submitted a response",
                          });
                        }
                      },
                    }
                  );
                }
              }}
              enableReinitialize
            >
              {({ isSubmitting }) => (
                <Form>
                  {submitted ? (
                    <Group spacing={8}>
                      <IconCheck size={16} />
                      <Text>Form submitted success!</Text>
                    </Group>
                  ) : (
                    <Stack>
                      {form?.authenticatedOnly && session?.user ? (
                        <Text>
                          Submitting as{" "}
                          <Avatar
                            src={session.user.image}
                            size="xs"
                            sx={{ display: "inline-block" }}
                          />{" "}
                          {session.user.name}
                        </Text>
                      ) : null}
                      {form?.fields.map((f) => (
                        <FormInput
                          key={f.id}
                          label={f.label}
                          description={f.description}
                          required={f.required}
                          column={f.Column}
                        />
                      ))}
                      <Button
                        type="submit"
                        variant="light"
                        loading={isSubmitting}
                        fullWidth
                      >
                        Submit
                      </Button>
                    </Stack>
                  )}
                </Form>
              )}
            </Formik>
          </Paper>
          <Text color={theme.colors.dark[4]}>
            Create your own database with Graspable.
          </Text>
        </Stack>
      </Center>
    </AppShell>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: { id: context.query.id },
  };
};

export default FormPage;
