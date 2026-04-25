"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plus, Layout, Type, Image, BarChart3, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Slide {
  id: string;
  type: "title" | "content" | "image" | "stats";
  title: string;
  content?: string;
}

export default function BuilderPage() {
  const [slides, setSlides] = useState<Slide[]>([{ id: "1", type: "title", title: "Welcome to Your Presentation" }]);

  const addSlide = (type: Slide["type"]) => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      type,
      title: type === "title" ? "New Title Slide" : "New Slide",
      content: type === "content" ? "Add your content here..." : undefined,
    };
    setSlides([...slides, newSlide]);
  };

  const removeSlide = (id: string) => {
    setSlides(slides.filter((s) => s.id !== id));
  };

  const updateSlide = (id: string, updates: Partial<Slide>) => {
    setSlides(slides.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const handleExport = async () => {
    if (slides.length === 0) {
      toast.error("No slides to export", {
        description: "Add at least one slide before exporting",
      });
      return;
    }

    try {
      const blueprint = {
        title: slides[0]?.title || "Untitled Presentation",
        slides,
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
        toast.success("Presentation exported successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Export failed", {
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
            <h1 className="text-xl font-semibold">Visual Builder</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Preview
            </Button>
            <Button size="sm" onClick={handleExport}>
              Export PPTX
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 flex gap-6">
        <aside className="w-64 shrink-0">
          <Card className="bg-white/5 border-white/10 p-4">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Slide
            </h2>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start border-white/20 hover:bg-white/10" onClick={() => addSlide("title")}>
                <Type className="h-4 w-4 mr-2" />
                Title Slide
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/20 hover:bg-white/10" onClick={() => addSlide("content")}>
                <Layout className="h-4 w-4 mr-2" />
                Content Slide
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/20 hover:bg-white/10" onClick={() => addSlide("image")}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image className="h-4 w-4 mr-2" />
                Image Slide
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/20 hover:bg-white/10" onClick={() => addSlide("stats")}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats Slide
              </Button>
            </div>
          </Card>
        </aside>

        <main className="flex-1 max-w-3xl mx-auto">
          <div className="space-y-4">
            {slides.map((slide, index) => (
              <Card key={slide.id} className="bg-white/5 border-white/10 p-6 relative group hover:bg-white/10 transition-colors">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1 text-gray-400">
                  <GripVertical className="h-4 w-4 cursor-grab" />
                  <span className="text-xs font-medium">{index + 1}</span>
                </div>
                <button onClick={() => removeSlide(slide.id)} className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="pl-8">
                  <input type="text" value={slide.title} onChange={(e) => updateSlide(slide.id, { title: e.target.value })} className="w-full text-xl font-semibold bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none pb-1" placeholder="Slide Title" />
                  {slide.content && <textarea value={slide.content} onChange={(e) => updateSlide(slide.id, { content: e.target.value })} className="w-full mt-3 text-gray-400 bg-transparent border border-white/20 rounded p-2 focus:border-blue-500 focus:outline-none resize-none" rows={3} placeholder="Add content..." />}
                  {slide.type === "image" && (
                    <div className="mt-4 p-8 border-2 border-dashed border-white/20 rounded-lg text-center text-gray-400">
                      {/* eslint-disable-next-line jsx-a11y/alt-text */}
                      <Image className="h-8 w-8 mx-auto mb-2" />
                      <p>Drop image here or click to upload</p>
                    </div>
                  )}
                  {slide.type === "stats" && (
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-lg text-center">
                          <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                          <input type="text" defaultValue="100" className="w-full text-2xl font-bold text-center bg-transparent" />
                          <input type="text" defaultValue="Metric" className="w-full text-sm text-gray-400 text-center bg-transparent mt-1" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {slides.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <Layout className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg">No slides yet</p>
              <p className="text-sm">Add your first slide from the sidebar</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
