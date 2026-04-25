"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import PreviewModal from "@/components/preview-modal";

const PROMPT = `Create a 6-slide presentation about the rise of AI in healthcare for hospital executives.
Include an overview of current AI applications,
key statistics on cost savings and diagnostic accuracy,
a comparison of leading AI tools,
implementation challenges, and a roadmap for adoption over the next 3 years.
Tone should be professional and data-driven.`;

export default function AIPage() {
  const [prompt, setPrompt] = useState(PROMPT);
  const [loading, setLoading] = useState(false);
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    fileId: "",
    slideCount: 0,
    title: "",
  });

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate a presentation");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (response.ok) {
        const data = await response.json();
        setPreviewModal({
          isOpen: true,
          fileId: data.fileId,
          slideCount: data.slideCount,
          title: data.title,
        });
        toast.success("Presentation generated successfully!");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to generate presentation", {
          description: error.message || "Please try again",
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
            <h1 className="text-xl font-semibold">AI Generator</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Powered by AI</span>
          </div>
          <h2 className="text-4xl font-bold mb-4">Describe your presentation</h2>
          <p className="text-gray-400 text-lg">Tell us what you need, and AI will create a stunning presentation for you</p>
        </div>

        <Card className="bg-white/5 border-white/10 p-6 mb-6">
          <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="e.g., Create a 5-slide presentation about Q4 sales performance for a tech startup, focusing on revenue growth, user acquisition, and future projections" className="w-full min-h-[200px] bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none text-lg scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/30" />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
            <span className="text-sm text-gray-500">{prompt.length} characters</span>
            <Button size="lg" onClick={handleGenerate} disabled={!prompt.trim() || loading} className="bg-purple-600 hover:bg-purple-700">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Presentation
                </>
              ) : (
                <>
                  {/* <Sparkles className="h-4 w-4 mr-2" /> */}
                  Generate Presentation
                </>
              )}
            </Button>
          </div>
        </Card>

        <div className="grid md:grid-cols-3 gap-4">
          <Card className="bg-white/5 border-white/10 p-4">
            <h3 className="font-semibold mb-2">Quick Start</h3>
            <p className="text-sm text-gray-400">Q4 Sales Review</p>
          </Card>
          <Card className="bg-white/5 border-white/10 p-4">
            <h3 className="font-semibold mb-2">Product Launch</h3>
            <p className="text-sm text-gray-400">New Feature Announcement</p>
          </Card>
          <Card className="bg-white/5 border-white/10 p-4">
            <h3 className="font-semibold mb-2">Team Update</h3>
            <p className="text-sm text-gray-400">Quarterly Roadmap</p>
          </Card>
        </div>
      </div>

      <PreviewModal isOpen={previewModal.isOpen} onClose={() => setPreviewModal({ ...previewModal, isOpen: false })} fileId={previewModal.fileId} slideCount={previewModal.slideCount} title={previewModal.title} />
    </div>
  );
}
