"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"
import { publicMediaUrl } from "@/lib/media-url"

function retrySource(source: string, attempt: number) {
  if (attempt === 0 || source.startsWith("blob:") || source.startsWith("data:")) {
    return source
  }

  const separator = source.includes("?") ? "&" : "?"
  return `${source}${separator}image_retry=${attempt}`
}

function useImageRetry(source: string, maxRetries: number) {
  const normalizedSource = publicMediaUrl(source)
  const [state, setState] = useState({
    source: normalizedSource,
    attempt: 0,
    failed: false,
  })
  const current =
    state.source === normalizedSource
      ? state
      : { source: normalizedSource, attempt: 0, failed: false }

  function retry() {
    if (current.attempt < maxRetries) {
      setState({ source, attempt: current.attempt + 1, failed: false })
      return true
    }
    setState({ source, attempt: current.attempt, failed: true })
    return false
  }

  return {
    failed: current.failed,
    retry,
    source: retrySource(normalizedSource, current.attempt),
  }
}

type RetryingNextImageProps = Omit<ImageProps, "src" | "onError"> & {
  src: string
  fallback?: React.ReactNode
  maxRetries?: number
}

export function RetryingNextImage({
  src,
  alt,
  fallback = null,
  maxRetries = 2,
  ...props
}: RetryingNextImageProps) {
  const retry = useImageRetry(src, maxRetries)

  if (retry.failed) return fallback

  return <Image {...props} src={retry.source} alt={alt} onError={retry.retry} />
}

type RetryingHtmlImageProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src" | "onError"
> & {
  src: string
  fallback?: React.ReactNode
  maxRetries?: number
  onFinalError?: () => void
}

export function RetryingHtmlImage({
  src,
  alt,
  fallback = null,
  maxRetries = 2,
  onFinalError,
  ...props
}: RetryingHtmlImageProps) {
  const retry = useImageRetry(src, maxRetries)

  if (retry.failed) return fallback

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      {...props}
      src={retry.source}
      alt={alt}
      onError={() => {
        if (!retry.retry()) onFinalError?.()
      }}
    />
  )
}
