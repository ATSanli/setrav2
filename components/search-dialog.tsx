'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const popularSearches = [
  'Ferace',
  'Abaya',
  'Şal',
  'Elbise',
  'Takım',
]

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) {
      setQuery('')
    }
  }, [open])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/arama?q=${encodeURIComponent(query.trim())}`)
      onOpenChange(false)
    }
  }

  const handlePopularSearch = (term: string) => {
    router.push(`/arama?q=${encodeURIComponent(term)}`)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-0 gap-0">
        <DialogTitle className="sr-only">Ürün Ara</DialogTitle>
        <form onSubmit={handleSearch} className="flex items-center border-b">
          <Search className="h-5 w-5 ml-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Ürün ara..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 border-0 focus-visible:ring-0 text-lg py-6"
            autoFocus
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </form>
        
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-3">Popüler Aramalar</p>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => handlePopularSearch(term)}
                className="px-3 py-1.5 text-sm border rounded-full hover:bg-secondary transition-colors"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
