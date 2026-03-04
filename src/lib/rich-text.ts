import sanitizeHtml from "sanitize-html";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "strong",
    "b",
    "em",
    "i",
    "s",
    "u",
    "h2",
    "ul",
    "ol",
    "li",
    "blockquote",
    "code",
    "pre",
    "a",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
  },
  allowedSchemes: ["http", "https", "mailto"],
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      rel: "noopener noreferrer nofollow",
      target: "_blank",
    }),
  },
};

export const sanitizeRichTextHtml = (content: string) => {
  return sanitizeHtml(content, SANITIZE_OPTIONS);
};

export const richTextToPlainText = (content: string) => {
  const stripped = sanitizeHtml(content, {
    allowedTags: [],
    allowedAttributes: {},
  });
  return stripped.replace(/\u00a0/g, " ").trim();
};
