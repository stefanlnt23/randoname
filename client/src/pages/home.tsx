import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateNamesSchema, type GenerateNamesRequest, type NameData, type SavedName } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Copy, Heart, X, Zap, Loader2, Sparkles, Info, Menu } from "lucide-react";

const culturalOrigins = [
  { value: "eng", label: "English", flag: "🇺🇸" },
  { value: "fre", label: "French", flag: "🇫🇷" },
  { value: "ger", label: "German", flag: "🇩🇪" },
  { value: "ita", label: "Italian", flag: "🇮🇹" },
  { value: "spa", label: "Spanish", flag: "🇪🇸" },
  { value: "por", label: "Portuguese", flag: "🇵🇹" },
  { value: "dut", label: "Dutch", flag: "🇳🇱" },
  { value: "swe", label: "Swedish", flag: "🇸🇪" },
  { value: "nor", label: "Norwegian", flag: "🇳🇴" },
  { value: "dan", label: "Danish", flag: "🇩🇰" },
  { value: "rus", label: "Russian", flag: "🇷🇺" },
  { value: "pol", label: "Polish", flag: "🇵🇱" },
  { value: "cze", label: "Czech", flag: "🇨🇿" }
];

export default function Home() {
  const [generatedNames, setGeneratedNames] = useState<NameData[]>([]);
  const [savedNames, setSavedNames] = useState<SavedName[]>([]);
  const [numberOfNames, setNumberOfNames] = useState(3);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const { toast } = useToast();

  const form = useForm<GenerateNamesRequest>({
    resolver: zodResolver(generateNamesSchema),
    defaultValues: {
      gender: '',
      usage: 'eng',
      number: 3,
      randomsurname: false
    }
  });

  // Load saved names from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedNames');
    if (saved) {
      try {
        setSavedNames(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved names:', error);
      }
    }
  }, []);

  // Save to localStorage whenever savedNames changes
  useEffect(() => {
    localStorage.setItem('savedNames', JSON.stringify(savedNames));
  }, [savedNames]);

  const generateNamesMutation = useMutation({
    mutationFn: async (data: GenerateNamesRequest) => {
      const response = await apiRequest('POST', '/api/generate-names', data);
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedNames(data.names || []);
    },
    onError: (error) => {
      toast({
        title: "Error generating names",
        description: error instanceof Error ? error.message : "Please check your connection and try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: GenerateNamesRequest) => {
    generateNamesMutation.mutate(data);
  };

  const copyToClipboard = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = name;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    }
  };

  const saveName = (nameData: NameData) => {
    const savedName: SavedName = {
      name: nameData.name,
      meaning: nameData.meaning,
      savedAt: new Date().toISOString()
    };
    setSavedNames(prev => {
      const exists = prev.some(saved => saved.name === nameData.name);
      if (exists) {
        return prev.filter(saved => saved.name !== nameData.name);
      }
      return [...prev, savedName];
    });
  };

  const removeSavedName = (name: string) => {
    setSavedNames(prev => prev.filter(saved => saved.name !== name));
  };

  const isNameSaved = (name: string) => {
    return savedNames.some(saved => saved.name === name);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NameGen
              </span>
            </div>
            <div className="hidden md:flex space-x-4">
              <Link href="/about">
                <Button variant="ghost" size="sm">About</Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" size="sm">Contact</Button>
              </Link>
              <Link href="/privacy">
                <Button variant="ghost" size="sm">Privacy</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <div className="relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Random Name Generator
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover perfect names from cultures around the world. For writers, parents, developers, and creators.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                13+ Cultural Origins
              </span>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-secondary" />
                Instant Generation
              </span>
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-accent" />
                Save Favorites
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Top Row: Gender Selection */}
            <div className="mb-8">
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-semibold block text-center mb-4">Gender</FormLabel>
                    <div className="flex flex-wrap gap-4 justify-center">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          value=""
                          id="any"
                          checked={field.value === ""}
                          onChange={() => field.onChange("")}
                          className="sr-only peer"
                        />
                        <Label
                          htmlFor="any"
                          className="px-6 py-3 rounded-xl border-2 border-border cursor-pointer peer-checked:border-primary peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary peer-checked:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium"
                        >
                          Any Gender
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          value="m"
                          id="male"
                          checked={field.value === "m"}
                          onChange={() => field.onChange("m")}
                          className="sr-only peer"
                        />
                        <Label
                          htmlFor="male"
                          className="px-6 py-3 rounded-xl border-2 border-border cursor-pointer peer-checked:border-primary peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary peer-checked:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium"
                        >
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          value="f"
                          id="female"
                          checked={field.value === "f"}
                          onChange={() => field.onChange("f")}
                          className="sr-only peer"
                        />
                        <Label
                          htmlFor="female"
                          className="px-6 py-3 rounded-xl border-2 border-border cursor-pointer peer-checked:border-primary peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary peer-checked:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium"
                        >
                          Female
                        </Label>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Left Column: Cultural Origins */}
              <Card className="border-2 gradient-border p-1">
                <div className="bg-card rounded-lg">
                  <CardHeader>
                    <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                      <Info className="w-5 h-5" />
                      Cultural Origins
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <FormField
                      control={form.control}
                      name="usage"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-3">
                              {culturalOrigins.map((origin) => (
                                <div key={origin.value} className="flex items-center">
                                  <input
                                    type="radio"
                                    value={origin.value}
                                    id={origin.value}
                                    checked={field.value === origin.value}
                                    onChange={() => field.onChange(origin.value)}
                                    className="sr-only peer"
                                  />
                                  <Label
                                    htmlFor={origin.value}
                                    className={`cultural-origin-btn w-full p-3 rounded-xl border-2 border-border cursor-pointer text-center transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                                      field.value === origin.value 
                                        ? 'border-primary bg-gradient-to-r from-primary/20 to-secondary/20 text-primary' 
                                        : 'hover:border-primary/50'
                                    }`}
                                  >
                                    <div className="text-xl mb-1">{origin.flag}</div>
                                    <div className="font-medium text-xs">{origin.label}</div>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </div>
              </Card>

              {/* Center Column: Controls and Generate Button */}
              <Card className="border-2 gradient-border p-1">
                <div className="bg-card rounded-lg">
                  <CardHeader>
                    <CardTitle className="text-lg text-center">Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Number of Names */}
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">
                            Number of Names: {field.value}
                          </FormLabel>
                          <FormControl>
                            <Slider
                              min={1}
                              max={10}
                              step={1}
                              value={[field.value]}
                              onValueChange={(value) => field.onChange(value[0])}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Random Surname Toggle */}
                    <FormField
                      control={form.control}
                      name="randomsurname"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm font-medium">
                              Include Surnames
                            </FormLabel>
                            <div className="text-xs text-muted-foreground">
                              Add random surnames to names
                            </div>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <Separator />

                    {/* Generate Button */}
                    <Button 
                      type="submit" 
                      disabled={generateNamesMutation.isPending}
                      className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {generateNamesMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Amazing Names
                        </>
                      )}
                    </Button>
                  </CardContent>
                </div>
              </Card>

              {/* Right Column: Generated Names */}
              <Card className="border-2 gradient-border p-1">
                <div className="bg-card rounded-lg">
                  <CardHeader>
                    <CardTitle className="text-lg text-center">Generated Names</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {generatedNames.length === 0 ? (
                      <div className="text-center py-8">
                        <Sparkles className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg mb-2">No names generated yet</p>
                        <p className="text-muted-foreground/70 text-sm">
                          Select your preferences and click generate!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {generatedNames.map((nameData, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-background/50 to-muted/30 p-4 rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300 group"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                                {nameData.name}
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(nameData.name)}
                                  className="text-muted-foreground hover:text-secondary hover:bg-background/50"
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => saveName(nameData)}
                                  className={`transition-colors duration-300 ${
                                    isNameSaved(nameData.name)
                                      ? 'text-accent'
                                      : 'text-muted-foreground hover:text-accent'
                                  } hover:bg-background/50`}
                                >
                                  <Heart className={`w-4 h-4 ${isNameSaved(nameData.name) ? 'fill-current' : ''}`} />
                                </Button>
                              </div>
                            </div>
                            {nameData.meaning && (
                              <p className="text-muted-foreground text-sm leading-relaxed">
                                {nameData.meaning}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </div>
              </Card>
            </div>
          </form>
        </Form>

        {/* Saved Names Section */}
        <Card className="mb-8 border-2 border-accent/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent flex items-center gap-2">
              <Heart className="w-6 h-6 text-accent" />
              Saved Names
            </CardTitle>
            <p className="text-muted-foreground">Your favorite names collection</p>
          </CardHeader>
          <CardContent>
            {savedNames.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg mb-2">No saved names yet</p>
                <p className="text-muted-foreground/70 text-sm">
                  Click the heart icon on generated names to save them here!
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {savedNames.map((saved, index) => (
                  <div
                    key={`${saved.name}-${saved.savedAt}`}
                    className="flex justify-between items-center bg-gradient-to-r from-background/50 to-muted/30 p-4 rounded-xl border border-border/50 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex-1">
                      <span className="font-semibold text-lg text-foreground">{saved.name}</span>
                      {saved.meaning && (
                        <p className="text-sm text-muted-foreground mt-1">{saved.meaning}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(saved.name)}
                        className="text-muted-foreground hover:text-secondary"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSavedName(saved.name)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Copy notification */}
      {showCopyToast && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300">
          Name copied to clipboard!
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-12 border-t border-border/50 mt-16">
        <div className="flex flex-wrap justify-center items-center gap-6 text-sm text-muted-foreground mb-6">
          <Link href="/about">
            <Button variant="ghost" size="sm" className="hover:text-primary">About</Button>
          </Link>
          <Link href="/contact">
            <Button variant="ghost" size="sm" className="hover:text-secondary">Contact</Button>
          </Link>
          <Link href="/privacy">
            <Button variant="ghost" size="sm" className="hover:text-accent">Privacy Policy</Button>
          </Link>
        </div>
        <div className="space-y-2">
          <p className="text-muted-foreground">
            Powered by{" "}
            <a
              href="https://www.behindthename.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-secondary transition-colors duration-300"
            >
              Behind the Name
            </a>
          </p>
          <p className="text-muted-foreground/70 text-sm">
            © 2024 NameGen. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}