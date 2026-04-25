"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, FileText, Check, X, Download } from "lucide-react";
import { toast } from "sonner";

export default function EditorPage() {
  const [json, setJson] = useState(`{
  "title": "Q4 Sales Presentation",
  "slides": [
    {
      "type": "title",
      "title": "Q4 2024 Sales Results",
      "subtitle": "Exceeding Expectations"
    },
    {
      "type": "content",
      "title": "Revenue Growth",
      "content": ["$2.5M total revenue", "+45% YoY growth", "3 new enterprise customers"]
    }
  ]
}`);
  const [valid, setValid] = useState(true);

  const handleValidate = async () => {
    try {
      const response = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: json,
      });
      const data = await response.json();
      setValid(data.valid);
      if (data.valid) {
        toast.success("Blueprint is valid!");
      } else {
        toast.error("Blueprint validation failed", {
          description: data.details?.[0]?.message || "Please check your JSON structure",
        });
      }
    } catch {
      setValid(false);
      toast.error("Invalid JSON", {
        description: "Please check your JSON syntax",
      });
    }
  };

  const handleExport = async () => {
    try {
      const blueprint = JSON.parse(json);
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
            <h1 className="text-xl font-semibold">Schema Editor</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleValidate}>
              <Check className="h-4 w-4 mr-2" />
              Validate
            </Button>
            <Button size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export PPTX
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex gap-6 h-[calc(100vh-64px)]">
        <div className="flex-1">
          <Card className="bg-white/5 border-white/10 h-full">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium">Blueprint JSON</span>
              </div>
              {valid ? (
                <div className="flex items-center gap-1 text-green-400 text-sm">
                  <Check className="h-4 w-4" />
                  Valid
                </div>
              ) : (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <X className="h-4 w-4" />
                  Invalid
                </div>
              )}
            </div>
            <textarea
              value={json}
              onChange={(e) => {
                setJson(e.target.value);
                try {
                  JSON.parse(e.target.value);
                  setValid(true);
                } catch {
                  setValid(false);
                }
              }}
              className="w-full h-[calc(100%-60px)] bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none p-4 font-mono text-sm"
              spellCheck={false}
            />
          </Card>
        </div>

        <div className="w-80">
          <Card className="bg-white/5 border-white/10 p-4">
            <h3 className="font-semibold mb-4">Schema Tips</h3>
            <div className="space-y-3 text-sm text-gray-400">
              <div>
                <p className="text-white font-medium">Title Slide</p>
                <code className="text-xs bg-white/10 px-2 py-1 rounded">type: &quot;title&quot;</code>
              </div>
              <div>
                <p className="text-white font-medium">Content Slide</p>
                <code className="text-xs bg-white/10 px-2 py-1 rounded">type: &quot;content&quot;</code>
              </div>
              <div>
                <p className="text-white font-medium">Image Slide</p>
                <code className="text-xs bg-white/10 px-2 py-1 rounded">type: &quot;image&quot;</code>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
