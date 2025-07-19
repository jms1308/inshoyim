import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Essay Not Found</h1>
      <p className="text-gray-600 mb-6">The essay you are looking for does not exist or may have been removed.</p>
      <Link href="/explore">
        <Button variant="outline">Back to Explore</Button>
      </Link>
    </div>
  )
} 