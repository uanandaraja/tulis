"use client"

import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react"

type PromptInputContextType = {
  isLoading: boolean
  value: string
  setValue: (value: string) => void
  maxHeight: number | string
  onSubmit?: () => void
  disabled?: boolean
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

const PromptInputContext = createContext<PromptInputContextType>({
  isLoading: false,
  value: "",
  setValue: () => {},
  maxHeight: 240,
  onSubmit: undefined,
  disabled: false,
  textareaRef: React.createRef<HTMLTextAreaElement>(),
})

function usePromptInput() {
  const context = useContext(PromptInputContext)
  if (!context) {
    throw new Error("usePromptInput must be used within a PromptInput")
  }
  return context
}

type PromptInputProps = {
  isLoading?: boolean
  value?: string
  onValueChange?: (value: string) => void
  maxHeight?: number | string
  onSubmit?: () => void
  children: React.ReactNode
  className?: string
}

const PromptInput = React.memo(function PromptInput({
  className,
  isLoading = false,
  maxHeight = 240,
  value,
  onValueChange,
  onSubmit,
  children,
}: PromptInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const contextValue = useMemo(() => ({
    isLoading,
    value: value || "",
    setValue: onValueChange || (() => {}),
    maxHeight,
    onSubmit,
    textareaRef,
  }), [isLoading, value, onValueChange, maxHeight, onSubmit])

  const handleClick = useCallback(() => {
    textareaRef.current?.focus()
  }, [])

  return (
    <PromptInputContext.Provider value={contextValue}>
      <div
        className={cn(
          "border-input bg-background cursor-text rounded-3xl border p-2 shadow-xs",
          className
        )}
        onClick={handleClick}
      >
        {children}
      </div>
    </PromptInputContext.Provider>
  )
})

export type PromptInputTextareaProps = {
  disableAutosize?: boolean
} & React.ComponentProps<typeof Textarea>

const PromptInputTextarea = React.memo(function PromptInputTextarea({
  className,
  onKeyDown,
  disableAutosize = false,
  ...props
}: PromptInputTextareaProps) {
  const { value, setValue, maxHeight, onSubmit, disabled, textareaRef } =
    usePromptInput()

  // Debounced autosize effect to reduce DOM calculations
  useEffect(() => {
    if (disableAutosize) return

    const textarea = textareaRef.current
    if (!textarea) return

    // Use requestAnimationFrame for smoother updates
    const rafId = requestAnimationFrame(() => {
      if (textarea.scrollTop === 0) {
        textarea.style.height = "auto"
      }

      textarea.style.height =
        typeof maxHeight === "number"
          ? `${Math.min(textarea.scrollHeight, maxHeight)}px`
          : `min(${textarea.scrollHeight}px, ${maxHeight})`
    })

    return () => cancelAnimationFrame(rafId)
  }, [value, maxHeight, disableAutosize])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSubmit?.()
    }
    onKeyDown?.(e)
  }, [onKeyDown, onSubmit])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
  }, [setValue])

  return (
    <Textarea
      ref={textareaRef}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={cn(
        "text-primary min-h-[44px] w-full resize-none border-none bg-transparent shadow-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      rows={1}
      disabled={disabled}
      {...props}
    />
  )
})

type PromptInputActionsProps = React.HTMLAttributes<HTMLDivElement>

const PromptInputActions = React.memo(function PromptInputActions({
  children,
  className,
  ...props
}: PromptInputActionsProps) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  )
})

type PromptInputActionProps = {
  className?: string
  tooltip: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
} & React.ComponentProps<typeof Tooltip>

const PromptInputAction = React.memo(function PromptInputAction({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: PromptInputActionProps) {
  const { disabled } = usePromptInput()

  const handleClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation()
  }, [])

  return (
    <Tooltip {...props}>
      <TooltipTrigger asChild disabled={disabled} onClick={handleClick}>
        {children}
      </TooltipTrigger>
      <TooltipContent side={side} className={className}>
        {tooltip}
      </TooltipContent>
    </Tooltip>
  )
})

// Wrap with TooltipProvider to prevent recreation on each render
const OptimizedPromptInput = PromptInput
const OptimizedPromptInputTextarea = PromptInputTextarea
const OptimizedPromptInputActions = PromptInputActions
const OptimizedPromptInputAction = PromptInputAction

export {
  OptimizedPromptInput as PromptInput,
  OptimizedPromptInputTextarea as PromptInputTextarea,
  OptimizedPromptInputActions as PromptInputActions,
  OptimizedPromptInputAction as PromptInputAction,
}
