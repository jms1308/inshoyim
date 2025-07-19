import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple implementation of cva for button variants
export function cva(base: string, config: any) {
  return (props: any) => {
    let classes = base

    if (config.variants && props) {
      Object.keys(config.variants).forEach((key) => {
        if (props[key] && config.variants[key][props[key]]) {
          classes += " " + config.variants[key][props[key]]
        }
      })
    }

    if (config.defaultVariants && !props) {
      Object.keys(config.defaultVariants).forEach((key) => {
        if (config.variants[key] && config.variants[key][config.defaultVariants[key]]) {
          classes += " " + config.variants[key][config.defaultVariants[key]]
        }
      })
    }

    return classes
  }
}

// Word counting utility
export function countWords(text: string): number {
  if (!text || typeof text !== "string") return 0

  // Remove extra whitespace and split by whitespace
  const words = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  return words.length
}

// Estimate reading time based on word count (average 200 words per minute)
export function estimateReadingTime(wordCount: number): string {
  const wordsPerMinute = 200
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return minutes === 1 ? "1 daqiqa o'qish" : `${minutes} daqiqa o'qish`
}
