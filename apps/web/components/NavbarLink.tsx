import {
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";

interface MainLinkProps {
  icon: React.ReactNode;
  color: string;
  label: string;
}

export function NavbarLink({ icon, color, label }: MainLinkProps) {
  const theme = useMantineTheme();
  return (
    <UnstyledButton
      p="0.25rem"
      sx={(theme) => ({
        display: "block",
        width: "100%",
        borderRadius: theme.radius.sm,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[2] : theme.black,
        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
        },
      })}
    >
      <Group spacing="sm">
        <ThemeIcon size="lg" color={color} variant="light">
          {icon}
        </ThemeIcon>
        <Text weight={500} size="sm">
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}
