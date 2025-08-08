"use client"

import { useState } from "react"
import { generateTags } from "@/ai/flows/generate-tags"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function TagGenerator() {
  const [content, setContent] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleGenerateTags = async () => {
    if (content.trim().split(/\s+/).length < 20) {
      toast({
        variant: "destructive",
        title: "Content too short",
        description: "Please provide at least 20 words to generate tags.",
      })
      return
    }

    setIsLoading(true)
    setTags([])

    try {
      const result = await generateTags({ content })
      setTags(result.tags)
    } catch (error) {
      console.error("Error generating tags:", error)
      toast({
        variant: "destructive",
        title: "An error occurred",
        description: "Failed to generate tags. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <Textarea
          placeholder="Paste the beginning of your essay here (at least 20 words)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="mb-4"
          disabled={isLoading}
        />
        <Button onClick={handleGenerateTags} disabled={isLoading || !content} className="w-full">
          {isLoading ? (
            "Generating..."
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Suggest Tags
            </>
          )}
        </Button>
      </CardContent>
      {tags.length > 0 && (
        <CardFooter className="bg-muted/50 p-4">
          <div className="flex flex-wrap gap-2">
            <p className="text-sm font-medium mr-2 self-center">Suggestions:</p>
            {tags.map((tag, index) => (
              <Badge key={index} variant="default" className="cursor-pointer text-sm">
                {tag}
              </Badge>
            ))}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
