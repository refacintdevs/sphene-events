"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PortfolioItemData } from "@/services/vendor";

interface PortfolioGalleryProps {
  items: PortfolioItemData[];
}

export function PortfolioGallery({ items }: PortfolioGalleryProps) {
  if (items.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((item, index) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <button
              className={`group relative overflow-hidden rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                index === 0 ? "col-span-2 aspect-video" : "aspect-square"
              }`}
              aria-label={item.caption ?? `Portfolio image ${index + 1}`}
            >
              <Image
                src={item.imageUrl}
                alt={item.caption ?? `Portfolio image ${index + 1}`}
                fill
                sizes={
                  index === 0
                    ? "(max-width: 640px) 100vw, 66vw"
                    : "(max-width: 640px) 50vw, 33vw"
                }
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {item.caption && (
                <span className="absolute inset-x-0 bottom-0 bg-black/50 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {item.caption}
                </span>
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl p-2">
            <DialogTitle className="sr-only">
              {item.caption ?? `Portfolio image ${index + 1}`}
            </DialogTitle>
            <div className="relative aspect-video w-full overflow-hidden rounded-md">
              <Image
                src={item.imageUrl}
                alt={item.caption ?? `Portfolio image ${index + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-contain"
              />
            </div>
            {item.caption && (
              <p className="mt-1 text-center text-sm text-muted-foreground">
                {item.caption}
              </p>
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
