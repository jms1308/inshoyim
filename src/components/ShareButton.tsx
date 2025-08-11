
"use client"

import { useState, useEffect } from "react"
import { Share2, Link as LinkIcon, Check, Facebook, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/hooks/use-toast"

const TwitterXIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="currentColor"
    viewBox="0 0 16 16"
  >
    <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.6.75Zm-1.7 12.95h1.847L4.49 2.05H2.583z" />
  </svg>
)

const TelegramIcon = () => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-5 w-5"
        fill="currentColor"
        viewBox="0 0 48 48">
        <path d="M41.41,8.59,6.7,21.82a4.42,4.42,0,0,0,0,8.13L15.3,33.4a4.43,4.43,0,0,0,4.78,1.42L26.3,30.6a2,2,0,0,1,2.53-.3l10-6.42a4.41,4.41,0,0,0-2-8.21ZM19.2,32.7,11,29.93a.42.42,0,0,1,0-.76L35,16.14a.42.42,0,0,1,.58.53Z"></path>
    </svg>
)

function getTextFromEditorJs(content: any): string {
    if (typeof content === 'string') {
        // Handle old plain text content for backward compatibility
        return content;
    }
    if (!content || !content.blocks) return '';
    return content.blocks
        .filter((block: any) => block.type === 'paragraph' || block.type === 'header')
        .map((block: any) => block.data.text.replace(/<[^>]*>?/gm, '')) // Strip HTML tags
        .join(' ');
}


export function ShareButton({ title, content }: { title: string, content: string }) {
  const [url, setUrl] = useState("")
  const [shareText, setShareText] = useState("");
  const [isCopied, setIsCopied] = useState(false)
  const [isWebShareSupported, setIsWebShareSupported] = useState(false)
  const [openPopover, setOpenPopover] = useState(false);
  const { toast } = useToast()

  useEffect(() => {
    const currentUrl = window.location.href;
    setUrl(currentUrl);
    
    const plainTextContent = getTextFromEditorJs(content);
    const excerpt = plainTextContent.split(' ').slice(0, 30).join(' ') + (plainTextContent.split(' ').length > 30 ? '...' : '');
    
    // Just the excerpt for the 'text' property
    setShareText(excerpt);

    if (navigator.share) {
      setIsWebShareSupported(true)
    }
  }, [title, content])

  const handleShare = async () => {
    if (isWebShareSupported) {
      try {
        await navigator.share({
          title: title,
          text: shareText,
          url: url,
        })
      } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error("Error sharing, falling back to popover:", error)
            setOpenPopover(true);
        }
      }
    } else {
        setOpenPopover(true);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setIsCopied(true)
    toast({
      title: "Nusxa olindi!",
      description: "Havolani endi ulashishingiz mumkin.",
    })
    setTimeout(() => setIsCopied(false), 2000)
  }
  
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const telegramText = encodeURIComponent(`*${title}*\n\n${shareText}`);

  
  const PopoverContentMenu = (
    <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-center mb-2">Inshoni ulashish</p>
        <div className="flex items-center gap-2">
            <a href={`https://t.me/share/url?url=${encodedUrl}&text=${telegramText}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon"><TelegramIcon /></Button>
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon"><TwitterXIcon /></Button>
            </a>
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon"><Facebook /></Button>
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon"><Linkedin /></Button>
            </a>
        </div>
        <Button variant="outline" onClick={copyToClipboard} className="mt-2">
            {isCopied ? <Check className="h-4 w-4 mr-2" /> : <LinkIcon className="h-4 w-4 mr-2" />}
            {isCopied ? "Nusxalandi!" : "Havoladan nusxa olish"}
        </Button>
    </div>
  )

  if (isWebShareSupported) {
    return (
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
            <PopoverTrigger asChild>
                 <Button onClick={handleShare} variant="outline" size="icon">
                    <Share2 className="h-5 w-5" />
                    <span className="sr-only">Ulashish</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto">
                {PopoverContentMenu}
            </PopoverContent>
        </Popover>
    )
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Share2 className="h-5 w-5" />
           <span className="sr-only">Ulashish</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto">
        {PopoverContentMenu}
      </PopoverContent>
    </Popover>
  )
}
