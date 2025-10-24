"use client"

import { cn } from "@/lib/utils"
import React, { createContext, useContext, useEffect, useState } from "react"
import { codeToHtml } from "shiki"
import { Button } from "@/components/ui/button"
import { CheckIcon, CopyIcon } from "lucide-react"

type CodeBlockContextType = {
  code: string
}

const CodeBlockContext = createContext<CodeBlockContextType>({
  code: "",
})

export type CodeBlockProps = {
  code: string
  language: string
  showLineNumbers?: boolean
  children?: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

function CodeBlock({ code, language, showLineNumbers = false, children, className, ...props }: CodeBlockProps) {
  const [highlightedHtml, setHighlightedHtml] = useState<string | null>(null)

  useEffect(() => {
    async function highlight() {
      if (!code) {
        setHighlightedHtml("<pre><code></code></pre>")
        return
      }

      const html = await codeToHtml(code, { 
        lang: language, 
        themes: {
          light: 'github-light',
          dark: 'github-dark',
        }
      })
      setHighlightedHtml(html)
    }
    highlight()
  }, [code, language])

  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div
        className={cn(
          "not-prose relative flex w-full flex-col overflow-clip border",
          "border-border bg-card text-card-foreground rounded-xl",
          className
        )}
        {...props}
      >
        {children && (
          <div className="absolute top-2 right-2 z-10">
            {children}
          </div>
        )}
        {highlightedHtml ? (
          <div
            className="w-full overflow-x-auto text-[13px] [&>pre]:px-4 [&>pre]:py-4 [&>pre]:m-0"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <div className="w-full overflow-x-auto text-[13px]">
            <pre className="px-4 py-4 m-0">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </CodeBlockContext.Provider>
  )
}

export type CodeBlockCopyButtonProps = {
  onCopy?: () => void
  onError?: (error: Error) => void
  timeout?: number
  className?: string
}

function CodeBlockCopyButton({
  onCopy,
  onError,
  timeout = 2000,
  className,
}: CodeBlockCopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false)
  const { code } = useContext(CodeBlockContext)

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      onError?.(new Error("Clipboard API not available"))
      return
    }

    try {
      await navigator.clipboard.writeText(code)
      setIsCopied(true)
      onCopy?.()
      setTimeout(() => setIsCopied(false), timeout)
    } catch (error) {
      onError?.(error as Error)
    }
  }

  const Icon = isCopied ? CheckIcon : CopyIcon

  return (
    <Button
      className={cn("shrink-0 h-8 w-8", className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
    >
      <Icon size={14} />
    </Button>
  )
}

export { CodeBlock, CodeBlockCopyButton }
