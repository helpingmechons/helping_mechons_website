"use client";
import Link from "next/link";
import { Heart, Share2 } from "lucide-react";

export default function MobileDonateBar() {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Helping Mechons", url: window.location.href });
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-primary border-t border-primary-container flex items-center gap-2 px-4 py-3">
      <Link href="/donate"
        className="flex-1 btn-primary justify-center py-3 text-base">
        <Heart className="w-4 h-4 fill-current" />
        Donate Now
      </Link>
      <button onClick={handleShare}
        className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary-container text-on-primary-container hover:bg-secondary hover:text-on-secondary transition-all flex-shrink-0">
        <Share2 className="w-5 h-5" />
      </button>
    </div>
  );
}
