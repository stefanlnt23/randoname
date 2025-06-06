import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Users, Lightbulb, Globe, Heart } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-background bg-cosmic">
      {/* Header */}
      <header className="bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Generator
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                About Random Name Generator
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                Discover the story behind our naming solution
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Mission Section */}
        <Card className="mb-8 border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-r from-primary to-secondary">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe that finding the perfect name should be effortless and inspiring. Our Random Name Generator 
              bridges cultures and languages, helping creators, parents, and storytellers discover names that resonate 
              with their vision.
            </p>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-secondary/20 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">For Everyone</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Writers crafting characters</li>
                <li>• Parents choosing baby names</li>
                <li>• Game developers creating worlds</li>
                <li>• Content creators seeking inspiration</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-accent/20 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">Global Reach</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground">
                <li>• 13+ cultural origins</li>
                <li>• Authentic name databases</li>
                <li>• Gender-specific options</li>
                <li>• Surname combinations</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Technology Section */}
        <Card className="mb-8 border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Lightbulb className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Powered by Behind the Name</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Our generator is powered by the comprehensive Behind the Name database, which contains thousands 
              of names from cultures around the world. This ensures you get authentic, meaningful names with 
              rich cultural heritage.
            </p>
            <p className="text-sm text-muted-foreground">
              Data provided by{" "}
              <a 
                href="https://www.behindthename.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                behindthename.com
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="text-center border-2 gradient-border p-1">
          <div className="bg-card rounded-lg p-6">
            <CardTitle className="text-xl mb-4">Have Questions or Suggestions?</CardTitle>
            <p className="text-muted-foreground mb-6">
              We'd love to hear from you! Reach out with feedback, feature requests, or just to say hello.
            </p>
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                Get in Touch
              </Button>
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}