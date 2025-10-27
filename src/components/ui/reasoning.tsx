"use client"

import { cn } from "@/lib/utils"
import { Brain, ChevronDownIcon } from "lucide-react"
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Markdown } from "./markdown"

type ReasoningContextType = {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const ReasoningContext = createContext<ReasoningContextType | undefined>(
  undefined
)

function useReasoningContext() {
  const context = useContext(ReasoningContext)
  if (!context) {
    throw new Error(
      "useReasoningContext must be used within a Reasoning provider"
    )
  }
  return context
}

export type ReasoningProps = {
  children: React.ReactNode
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  isStreaming?: boolean
}
function Reasoning({
  children,
  className,
  open,
  onOpenChange,
  isStreaming,
}: ReasoningProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [wasAutoOpened, setWasAutoOpened] = useState(false)

  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setInternalOpen(newOpen)
    }
    onOpenChange?.(newOpen)
  }

  useEffect(() => {
    if (isStreaming && !wasAutoOpened) {
      if (!isControlled) setInternalOpen(true)
      setWasAutoOpened(true)
    }

    if (!isStreaming && wasAutoOpened) {
      if (!isControlled) setInternalOpen(false)
      setWasAutoOpened(false)
    }
  }, [isStreaming, wasAutoOpened, isControlled])

  return (
    <ReasoningContext.Provider
      value={{
        isOpen,
        onOpenChange: handleOpenChange,
      }}
    >
      <div className={cn("mt-3", className)}>{children}</div>
    </ReasoningContext.Provider>
  )
}

export type ReasoningTriggerProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLAttributes<HTMLButtonElement>

function ReasoningTrigger({
  children,
  className,
  ...props
}: ReasoningTriggerProps) {
  const { isOpen, onOpenChange } = useReasoningContext()

  return (
    <button
      className={cn("flex cursor-pointer items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground", className)}
      onClick={() => onOpenChange(!isOpen)}
      {...props}
    >
      <Brain className="size-3.5" />
      <span>{children}</span>
      <div
        className={cn(
          "transform transition-transform",
          isOpen ? "rotate-180" : ""
        )}
      >
        <ChevronDownIcon className="size-4" />
      </div>
    </button>
  )
}

export type ReasoningContentProps = {
  children: React.ReactNode
  className?: string
  markdown?: boolean
  contentClassName?: string
} & React.HTMLAttributes<HTMLDivElement>

function ReasoningContent({
  children,
  className,
  contentClassName,
  markdown = false,
  ...props
}: ReasoningContentProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const { isOpen } = useReasoningContext()

  useEffect(() => {
    if (!contentRef.current || !innerRef.current) return

    if (isOpen) {
      // Remove max-height when open to allow full content
      contentRef.current.style.maxHeight = "none"
    }
  }, [isOpen, children])

  const content = markdown ? (
    <Markdown>{children as string}</Markdown>
  ) : (
    children
  )

  return (
    <div
      ref={contentRef}
      className={cn(
        "overflow-hidden transition-[max-height] duration-150 ease-out",
        isOpen && "border-l-[0.75px] border-border pl-3",
        className
      )}
      style={{
        maxHeight: isOpen ? "none" : "0px",
      }}
      {...props}
    >
      <div
        ref={innerRef}
        className={cn(
          "text-muted-foreground prose prose-xs dark:prose-invert",
          contentClassName
        )}
      >
        {content}
      </div>
    </div>
  )
}

export { Reasoning, ReasoningTrigger, ReasoningContent }
