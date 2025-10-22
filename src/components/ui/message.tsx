import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Markdown } from "./markdown"
import { Source, SourceTrigger, SourceContent } from "./source"
import type { Components } from "react-markdown"

export type MessageProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

const Message = ({ children, className, ...props }: MessageProps) => (
  <div className={cn("flex gap-3", className)} {...props}>
    {children}
  </div>
)

export type MessageAvatarProps = {
  src: string
  alt: string
  fallback?: string
  delayMs?: number
  className?: string
}

const MessageAvatar = ({
  src,
  alt,
  fallback,
  delayMs,
  className,
}: MessageAvatarProps) => {
  return (
    <Avatar className={cn("h-8 w-8 shrink-0", className)}>
      <AvatarImage src={src} alt={alt} />
      {fallback && (
        <AvatarFallback delayMs={delayMs}>{fallback}</AvatarFallback>
      )}
    </Avatar>
  )
}

export type MessageContentProps = {
  children: React.ReactNode
  markdown?: boolean
  className?: string
  sources?: Array<{ id: number; url: string; title: string }>
} & React.ComponentProps<typeof Markdown> &
  React.HTMLProps<HTMLDivElement>

const replaceCitationsWithSources = (
  text: string,
  sources: Array<{ id: number; url: string; title: string }>
): string => {
  return text.replace(/\[(\d+)\]/g, (match) => {
    const id = parseInt(match.slice(1, -1), 10)
    const source = sources.find(s => s.id === id)
    return source ? `[${source.title}](${source.url})` : match
  })
}

const MessageContent = ({
  children,
  markdown = false,
  className,
  sources = [],
  ...props
}: MessageContentProps) => {
  const classNames = cn(
    "rounded-lg p-2 text-foreground bg-secondary prose break-words whitespace-normal",
    className
  )

  const processedContent = markdown && sources.length > 0 
    ? replaceCitationsWithSources(children as string, sources)
    : (children as string)

  const customComponents: Partial<Components> | undefined = markdown && sources.length > 0 ? {
    a: ({ href, children: linkChildren }) => {
      if (!href) return <a>{linkChildren}</a>
      const source = sources.find(s => s.url === href)
      const linkText = Array.isArray(linkChildren) ? linkChildren[0] : linkChildren
      if (source && typeof linkText === 'string') {
        return (
          <Source href={href}>
            <SourceTrigger showFavicon label={linkText} />
            <SourceContent title={source.title} description={href} />
          </Source>
        )
      }
      return <a href={href} target="_blank" rel="noopener noreferrer">{linkChildren}</a>
    },
  } : undefined

  return markdown ? (
    <Markdown className={classNames} components={customComponents} {...props}>
      {processedContent}
    </Markdown>
  ) : (
    <div className={classNames} {...props}>
      {children}
    </div>
  )
}

export type MessageActionsProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

const MessageActions = ({
  children,
  className,
  ...props
}: MessageActionsProps) => (
  <div
    className={cn("text-muted-foreground flex items-center gap-2", className)}
    {...props}
  >
    {children}
  </div>
)

export type MessageActionProps = {
  className?: string
  tooltip: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
} & React.ComponentProps<typeof Tooltip>

const MessageAction = ({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: MessageActionProps) => {
  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className={className}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { Message, MessageAvatar, MessageContent, MessageActions, MessageAction }
