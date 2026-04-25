"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { toast } from "sonner";

export default function PreviewPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { title: "Q4 2024 Sales Results", subtitle: "Exceeding Expectations", type: "title" },
    { title: "Revenue Growth", content: ["$2.5M total revenue", "+45% YoY growth", "3 new enterprise customers"], type: "content" },
    { title: "Key Metrics", type: "stats" },
  ];

  const handleDownload = async () => {
    try {
      const blueprint = {
        title: "Q4 2024 Sales Presentation",
        slides: slides,
      };
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blueprint }),
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "presentation.pptx";
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Presentation downloaded successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Download failed", {
          description: error.message || "Please try again",
        });
      }
    } catch {
      toast.error("Network error", {
        description: "Please check your connection and try again",
      });
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Preview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-2" />
              Play
            </Button>
            <Button size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Export PPTX
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        <div className="aspect-video w-full max-w-5xl bg-white rounded-lg shadow-2xl mb-6 flex items-center justify-center">
          <div className="text-center text-black p-12">
            <h2 className="text-5xl font-bold mb-4">{slides[currentSlide].title}</h2>
            {slides[currentSlide].subtitle && <p className="text-2xl text-gray-600">{slides[currentSlide].subtitle}</p>}
            {slides[currentSlide].content && (
              <ul className="text-xl text-gray-600 mt-8 space-y-2">
                {slides[currentSlide].content.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? "bg-white" : "bg-white/30"}`} />
            ))}
          </div>
          <Button variant="outline" size="icon" onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} disabled={currentSlide === slides.length - 1}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-gray-400 mt-2">
          Slide {currentSlide + 1} of {slides.length}
        </p>
      </div>
    </div>
  );
}
