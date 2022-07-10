import {
  Box,
  Button,
  Container,
  createStyles,
  Group,
  List,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { IconArrowRight, IconCheck } from "@tabler/icons";
import Head from "next/head";
import Link from "next/link";
import React from "react";

const useStyles = createStyles((theme) => ({
  inner: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: theme.spacing.xl * 4,
    paddingBottom: theme.spacing.xl * 4,
  },

  content: {
    marginRight: theme.spacing.xl * 3,

    [theme.fn.smallerThan("md")]: {
      maxWidth: "100%",
      marginRight: 0,
    },
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontSize: 44,
    lineHeight: 1.4,
    fontWeight: 900,

    [theme.fn.smallerThan("xs")]: {
      fontSize: 36,
    },
  },

  control: {
    [theme.fn.smallerThan("xs")]: {
      flex: 1,
    },
  },

  image: {
    flex: 1,

    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  highlight: {
    position: "relative",
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.fn.rgba(theme.colors[theme.primaryColor][6], 0.4)
        : theme.colors[theme.primaryColor][0],
    borderRadius: theme.radius.sm,
    padding: "4px 12px",
  },
}));

const HomePage: React.FC = () => {
  const { classes } = useStyles();

  return (
    <Box p="1rem">
      <Head>
        <title>Graspable - A lightweight alternative to Airtable</title>
      </Head>
      <Container>
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              A <span className={classes.highlight}>Lightweight</span>{" "}
              Alternative <br /> to Excel, Airtable, and Trello
            </Title>
            <List
              mt={30}
              spacing="sm"
              size="sm"
              sx={{ fontSize: 18, lineHeight: 1.8 }}
              icon={
                <ThemeIcon size={24} radius="xl">
                  <IconCheck size={16} strokeWidth={3} />
                </ThemeIcon>
              }
            >
              <List.Item>Open Source</List.Item>
              <List.Item>Developer friendly SDK</List.Item>
              <List.Item>Variety of column types and views</List.Item>
              <List.Item>Generous Free Tier</List.Item>
            </List>
            <Group mt={40}>
              <Link href="/auth/login" passHref>
                <Button
                  size="lg"
                  className={classes.control}
                  rightIcon={<IconArrowRight size={24} />}
                >
                  Let's get started
                </Button>
              </Link>
              <Button variant="default" size="lg" className={classes.control}>
                View pricing
              </Button>
            </Group>
          </div>
          {/* <Image src={image.src} className={classes.image} /> */}
        </div>
      </Container>
    </Box>
  );
};

export default HomePage;
