"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
  slideCount: number;
  title: string;
}

export default function PreviewModal({ isOpen, onClose, fileId, slideCount, title }: PreviewModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/download/${fileId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "presentation.pptx";
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success("Presentation downloaded successfully!");
        onClose();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Download failed", {
          description: errorData.message || "Please try again",
        });
      }
    } catch {
      toast.error("Network error", {
        description: "Please check your connection and try again",
      });
    } finally {
      setLoading(false);
    }
  };

  const slides = Array.from({ length: slideCount }, (_, i) => ({
    index: i,
    title: i === 0 ? title : `Slide ${i + 1}`,
    thumbnailUrl: `/api/ai/thumbnail/${fileId}/${i}`,
  }));

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <p className="text-sm text-gray-400">{slideCount} slides</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} disabled={loading} className="text-black! cursor-pointer!">
              <Download className="h-4 w-4 mr-2" />
              {loading ? "Downloading..." : "Download PPTX"}
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="cursor-pointer!">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 overflow-auto p-6 flex flex-col items-center">
          <Card className="w-full max-w-4xl aspect-video bg-white rounded-lg flex items-center justify-center p-8">
            <div className="text-center text-black w-full">
              <h3 className="text-4xl font-bold mb-4">{slides[currentSlide].title}</h3>
              <p className="text-gray-600">Slide preview will be rendered here</p>
              <p className="text-sm text-gray-400 mt-4">(Thumbnail generation coming soon)</p>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex items-center gap-4 mt-6">
            <Button variant="outline" size="icon" onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} disabled={currentSlide === 0} className="text-black cursor-pointer!">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2 h-2 rounded-full transition-colors ${i === currentSlide ? "bg-white" : "bg-white/30"}`} />
              ))}
            </div>
            <Button variant="outline" size="icon" onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} disabled={currentSlide === slides.length - 1} className="text-black cursor-pointer!">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-gray-400 mt-2">
            Slide {currentSlide + 1} of {slides.length}
          </p>
        </div>
      </div>
    </div>
  );
}
