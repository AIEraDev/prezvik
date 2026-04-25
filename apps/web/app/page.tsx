import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Sparkles, Download, Zap, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative overflow-hidden pt-20 pb-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sm mb-6">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span>Now with AI-powered generation</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-linear-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">Kyro</h1>
            <p className="text-xl md:text-2xl text-gray-400 mb-8">The AI-native presentation platform. Create stunning decks in seconds, not hours.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/ai">
                <Button size="lg" className="bg-white text-black hover:bg-gray-200 cursor-pointer">
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate with AI
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
              <Link href="/editor">
                <Button size="lg" className="border-white/20 hover:bg-white/10 cursor-pointer">
                  <FileText className="h-4 w-4 mr-1" />
                  Schema Editor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-semibold text-center mb-12 text-gray-300">Three ways to create</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group flex flex-col justify-between">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="h-6 w-6 text-purple-400" />
                </div>
                <CardTitle className="text-white">AI Generator</CardTitle>
                <CardDescription className="text-gray-400">Describe what you want and let AI create the perfect presentation</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/ai">
                  <Button variant="ghost" className="w-full text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 cursor-pointer">
                    Start Creating
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group flex flex-col justify-between">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
                <CardTitle className="text-white">Schema Editor</CardTitle>
                <CardDescription className="text-gray-400">Precise control with JSON blueprints</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/editor">
                  <Button variant="ghost" className="w-full text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 cursor-pointer">
                    Open Editor
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors group flex flex-col justify-between">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Download className="h-6 w-6 text-orange-400" />
                </div>
                <CardTitle className="text-white">Preview & Export</CardTitle>
                <CardDescription className="text-gray-400">Review your slides and download as PowerPoint</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/preview">
                  <Button variant="ghost" className="w-full text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 cursor-pointer">
                    View Preview
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-12 text-center">
            <div>
              <div className="text-3xl font-bold text-white">10x</div>
              <div className="text-sm text-gray-500">Faster than traditional tools</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">3</div>
              <div className="text-sm text-gray-500">Access methods: CLI, API, MCP</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">∞</div>
              <div className="text-sm text-gray-500">AI-generated variations</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Kyro — AI-Powered Presentation Engine</p>
        </div>
      </footer>
    </div>
  );
}
