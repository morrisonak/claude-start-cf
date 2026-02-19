import parse, {
  type HTMLReactParserOptions,
  Element,
  domToReact,
} from 'html-react-parser'
import { Link } from '@tanstack/react-router'

type MarkdownProps = {
  markup: string
  className?: string
}

export function Markdown({ markup, className }: MarkdownProps) {
  const options: HTMLReactParserOptions = {
    replace: (domNode) => {
      if (domNode instanceof Element) {
        if (domNode.name === 'a') {
          const href = domNode.attribs.href
          if (href?.startsWith('/')) {
            return (
              <Link to={href}>
                {domToReact(domNode.children as any, options)}
              </Link>
            )
          }
        }

        if (domNode.name === 'img') {
          return (
            <img
              {...domNode.attribs}
              loading="lazy"
              className="rounded-lg shadow-md"
            />
          )
        }
      }
    },
  }

  return (
    <div className={className ?? 'prose prose-invert max-w-none'}>
      {parse(markup, options)}
    </div>
  )
}
