import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownProps = {
  content: string;
};

export default function Markdown({ content }: MarkdownProps) {
  return (
    <div className="space-y-4 text-[17px] leading-7 text-ink">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => (
            <h1
              className="mt-8 text-3xl font-serif tracking-tight"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="mt-8 text-2xl font-serif tracking-tight"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="mt-6 text-xl font-serif tracking-tight"
              {...props}
            >
              {children}
            </h3>
          ),
          a: ({ children, ...props }) => (
            <a
              className="font-medium text-accent underline underline-offset-4"
              {...props}
            >
              {children}
            </a>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-2 border-accent pl-4 text-muted"
              {...props}
            >
              {children}
            </blockquote>
          ),
          code: ({ children, ...props }) => (
            <code
              className="rounded bg-paper-contrast px-1 py-0.5 font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
