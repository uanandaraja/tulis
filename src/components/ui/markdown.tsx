import { cn } from "@/lib/utils"
import { memo } from "react"
import { Streamdown } from "streamdown"
import type { Components } from "react-markdown"

export type MarkdownProps = {
  children: string
  id?: string
  className?: string
  components?: Partial<Components>
}

function MarkdownComponent({
  children,
  className,
  components,
}: MarkdownProps) {
  return (
    <Streamdown className={cn("prose prose-sm max-w-none", className)} components={components}>
      {children}
    </Streamdown>
  )
}

const Markdown = memo(MarkdownComponent)
Markdown.displayName = "Markdown"

export { Markdown }
