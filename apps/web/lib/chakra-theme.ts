import { extendTheme } from "@chakra-ui/react";
import { theme as DefaultTheme } from "@chakra-ui/theme";
import { createBreakpoints, mode } from "@chakra-ui/theme-tools";

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
      50: "#FAFAFA",
      100: "#F5F5F5",
      200: "#E5E5E5",
      300: "#D4D4D4",
      400: "#A3A3A3",
      500: "#737373",
      600: "#525252",
      700: "#404040",
      800: "#262626",
      900: "#171717",
    },
  },
  components: {
    Button: {
      baseStyle: (props: any) => ({
        color: mode("gray.500", "gray.400")(props),
        borderRadius: "xl",
        _focus: { boxShadow: "none" },
        "&:focus-visible": { boxShadow: "outline" },
      }),
      colors: {
        gray: {
          bg: "gray.200",
        },
      },
      sizes: {
        lg: {
          fontSize: "md",
        },
      },
      variants: {
        ghost: (props: any) => {
          const defaults = DefaultTheme.components.Button.variants.ghost(props);
          return {
            ...defaults,
            color: props.colorScheme === "gray" ? "gray.400" : defaults.color,
          };
        },
        outline: (props: any) => {
          const defaults =
            DefaultTheme.components.Button.variants.outline(props);
          return {
            ...defaults,
            border: "2px solid",
            borderColor:
              props.colorScheme === "gray"
                ? mode("gray.100", "gray.700")(props)
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
          border: "2px solid",
        },
      },
    },
    Menu: {
      parts: ["list", "divider", "item"],
      baseStyle: (props: any) => ({
        list: {
          border: "2px solid",
          borderColor: mode("gray.100", "gray.700")(props),
          bgColor: mode("white", "gray.800")(props),
          rounded: "xl",
          shadow: "none",
        },
        divider: {
          borderBottom: "2px solid",
          borderColor: mode("gray.100", "gray.700")(props),
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
          _focus: { boxShadow: "none" },
          "&:focus-visible": { boxShadow: "outline" },
        },
      }),
    },
  },
  fonts: {
    serif: "Lora, serif",
    eudoxus: "Eudoxus Sans, Inter, system-ui, sans-serif",
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  styles: {
    global: (props: any) => ({
      body: {
        margin: 0,
        fontWeight: "medium",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
        a: {
          color: "blue.500",
          "&:hover": {
            textDecoration: "none",
          },
        },
        "*, ::before, ::after": {
          borderColor: "#9fa3b114",
        },
        ".clear": {
          clear: "both",
        },
        ".ProseMirror, .typography": {
          mt: 4,
          color: "gray.500",
          lineHeight: "taller",
          "> * + *": {
            marginTop: "0.75em",
          },
          "p.is-empty::before": {
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
            color: "gray.600",
            my: 6,
          },
          h2: {
            fontSize: "1.4rem",
            color: "gray.600",
            my: 4,
          },
          h3: {
            fontSize: "1.2rem",
            color: "gray.600",
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
            ".hljs-comment, .hljs-quote": {
              color: "#616161",
            },

            ".hljs-variable, .hljs-template-variable,  .hljs-attribute, .hljs-tag, .hljs-name, .hljs-regexp, .hljs-link, .hljs-name, .hljs-selector-id, .hljs-selector-class":
              {
                color: "#F98181",
              },

            ".hljs-number,  .hljs-meta, .hljs-built_in, .hljs-builtin-name, .hljs-literal,  .hljs-type, .hljs-params":
              {
                color: "#FBBC88",
              },

            ".hljs-string, .hljs-symbol, .hljs-bullet": {
              color: "#B9F18D",
            },

            ".hljs-title, .hljs-section": {
              color: "#FAF594",
            },

            ".hljs-keyword, .hljs-selector-tag": {
              color: "#70CFF8",
            },

            ".hljs-emphasis": {
              fontStyle: "italic",
            },

            ".hljs-strong": {
              fontWeight: 700,
            },
          },
          blockquote: {
            pl: 4,
            borderLeft: "2px solid rgba(13, 13, 13, 0.1)",
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
