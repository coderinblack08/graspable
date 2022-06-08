import { chakra, Select as ChakraSelect, extendTheme } from "@chakra-ui/react";
import { theme as DefaultTheme } from "@chakra-ui/theme";
import { createBreakpoints, mode } from "@chakra-ui/theme-tools";

export const Select = chakra(ChakraSelect, {
  baseStyle: {
    rounded: "xl",
    border: "2px solid",
    borderColor: "gray.100",
  },
});

export const theme = extendTheme({
  breakpoints: createBreakpoints({
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
    "2xl": "96em",
  }),
  colors: {
    gray: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827",
    },
  },
  components: {
    Button: {
      baseStyle: (props: any) => ({
        color: mode("gray.800", "gray.400")(props),
        borderRadius: "lg",
        _focus: { boxShadow: "none" },
        "&:focus-visible": { boxShadow: "outline" },
      }),
      colors: {
        gray: {
          bg: "gray.200",
        },
        black: {
          bg: "gray.800",
        },
      },
      variants: {
        // ghost: (props: any) => {
        //   const defaults = DefaultTheme.components.Button.variants.ghost(props);
        //   return {
        //     ...defaults,
        //     color: props.colorScheme === "gray" ? "gray.400" : defaults.color,
        //   };
        // },
        outline: (props: any) => {
          const defaults =
            DefaultTheme.components.Button.variants.outline(props);
          return {
            ...defaults,
            borderColor:
              props.colorScheme === "gray"
                ? mode("gray.200", "gray.700")(props)
                : defaults.borderColor,
            _hover: { bg: "transparent" },
            _active: { bg: "transparent" },
          };
        },
      },
    },
    Input: {
      variants: {
        outline: {
          field: {
            rounded: "xl",
            borderColor: "gray.100",
            border: "2px solid",
          },
        },
      },
    },
    Textarea: {
      variants: {
        outline: {
          rounded: "xl",
          borderColor: "gray.100",
          border: "2px solid",
        },
      },
    },
    Menu: {
      parts: ["list", "divider", "item"],
      baseStyle: (props: any) => ({
        list: {
          borderColor: mode("gray.200", "gray.700")(props),
          bgColor: mode("white", "gray.800")(props),
          rounded: "lg",
        },
        divider: {
          borderBottom: "2px solid",
          borderColor: mode("gray.200", "gray.700")(props),
        },
        item: {
          color: mode("gray.500", "gray.400")(props),
          fontWeight: "medium",
          py: 2,
          px: 4,
        },
      }),
    },
    Tabs: {
      parts: ["tab"],
      baseStyle: (props: any) => ({
        tab: {
          _focus: { shadow: "none" },
          "&:focus-visible": { shadow: "outline" },
        },
      }),
    },
    Modal: {
      parts: ["dialog", "header", "overlay", "closeButton"],
      baseStyle: (props: any) => ({
        dialog: {
          rounded: "2xl",
        },
        header: {
          borderBottom: "2px solid",
          borderColor: mode("gray.100", "gray.600")(props),
          textAlign: "center",
        },
        closeButton: {
          m: 2,
          color: "gray.400",
          _focus: { boxShadow: "none" },
          "&:focus-visible": { boxShadow: "outline" },
        },
      }),
    },
  },
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  styles: {
    global: (props: any) => ({
      // ":root": {
      //   fontSize: "14px",
      // },
      body: {
        margin: 0,
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        ".ProseMirror, .typography": {
          py: 2,
          color: "gray.600",
          fontSize: "lg",
          lineHeight: "taller",
          "> * + *": {
            marginTop: "0.5em",
          },
          ".is-empty:first-child::before": {
            content: "attr(data-placeholder)",
            color: "gray.300",
            float: "left",
            pointerEvents: "none",
            height: 0,
          },
          "&:focus": {
            outline: "none",
          },
          h1: {
            fontSize: "1.6rem",
            letterSpacing: "-0.025rem",
            color: "gray.900",
            my: 6,
          },
          h2: {
            fontSize: "1.4rem",
            letterSpacing: "-0.025rem",
            color: "gray.900",
            my: 4,
          },
          h3: {
            fontSize: "1.2rem",
            color: "gray.900",
          },
          "h1, h2, h3, h4,  h5, h6 ": {
            lineHeight: "1.1",
            fontWeight: "700",
          },
          "ul, ol": {
            padding: "0 1.2rem",
          },
          code: {
            bg: "rgba(#616161, 0.1)",
            color: "#616161",
          },
          pre: {
            fontFamily: "JetBrainsMono, 'Courier New', Courier, monospace",
            background: mode("gray.900", "blue.200")(props),
            color: mode("white", "gray.900")(props),
            padding: "0.75rem 1rem",
            rounded: "lg",
            whiteSpace: "pre-wrap",
            code: {
              color: "inherit",
              p: 0,
              background: "none",
            },
          },
          blockquote: {
            pl: 5,
            borderLeft: "3px solid rgba(13, 13, 13, 0.1)",
          },
          "span[data-spoiler]": {
            bg: mode("gray.900", "gray.100")(props),
            _hover: {
              bg: "transparent",
            },
            // @apply dark:bg-gray-100 bg-gray-900 dark:hover:bg-transparent hover:bg-transparent;
          },
          img: {
            maxW: "full",
            h: "auto",
          },
          mark: {
            bg: "#FAF594",
          },
          hr: {
            borderTop: "2px solid",
            borderColor: "gray.100",
            margin: "2rem 0",
          },
        },
      },
      ".chakra-menu__icon-wrapper, .chakra-icon": {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      },
      "[contenteditable=true]:empty:before": {
        content: "attr(placeholder)",
        color: "gray.300",
        pointerEvents: "none",
        display: "block",
      },
    }),
  },
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
});
