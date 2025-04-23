
import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  return <ReactMarkdown>{content}</ReactMarkdown>;
}
