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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
    if (savedNames.some(saved => saved.name === nameData.name)) {
      return;
    }
    
    const savedName: SavedName = {
      name: nameData.name,
      meaning: nameData.meaning,
      savedAt: Date.now()
    };
    
    setSavedNames(prev => [...prev, savedName]);
    toast({
      title: "Name saved!",
      description: `"${nameData.name}" has been added to your saved names.`
    });
  };

  const removeSavedName = (index: number) => {
    setSavedNames(prev => prev.filter((_, i) => i !== index));
  };

  const isNameSaved = (name: string) => {
    return savedNames.some(saved => saved.name === name);
  };

  return (
    <div className="min-h-screen bg-background bg-cosmic">
      {/* Navigation */}
      <nav className="bg-card/50 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-primary" />
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                NameCraft
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Control Panel */}
        <Card className="mb-8 border-2 gradient-border p-1">
          <div className="bg-card rounded-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Generate Names
              </CardTitle>
              <p className="text-muted-foreground">Choose your preferences and discover amazing names</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Gender Selection */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">Gender</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                            className="flex flex-wrap gap-4 justify-center"
                          >
                            <div className="flex items-center">
                              <RadioGroupItem value="" id="any" className="sr-only peer" />
                              <Label
                                htmlFor="any"
                                className="px-6 py-3 rounded-xl border-2 border-border cursor-pointer peer-checked:border-primary peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary peer-checked:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium"
                              >
                                Any Gender
                              </Label>
                            </div>
                            <div className="flex items-center">
                              <RadioGroupItem value="m" id="male" className="sr-only peer" />
                              <Label
                                htmlFor="male"
                                className="px-6 py-3 rounded-xl border-2 border-border cursor-pointer peer-checked:border-primary peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary peer-checked:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium"
                              >
                                Male
                              </Label>
                            </div>
                            <div className="flex items-center">
                              <RadioGroupItem value="f" id="female" className="sr-only peer" />
                              <Label
                                htmlFor="female"
                                className="px-6 py-3 rounded-xl border-2 border-border cursor-pointer peer-checked:border-primary peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-secondary peer-checked:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg font-medium"
                              >
                                Female
                              </Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cultural Origin with Flags */}
                  <FormField
                    control={form.control}
                    name="usage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold flex items-center gap-2">
                          Cultural Origin
                          <Info className="w-4 h-4 text-muted-foreground" />
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {culturalOrigins.map((origin) => (
                              <div key={origin.value} className="flex items-center">
                                <RadioGroupItem value={origin.value} id={origin.value} className="sr-only peer" />
                                <Label
                                  htmlFor={origin.value}
                                  className={`cultural-origin-btn w-full p-4 rounded-xl border-2 border-border cursor-pointer text-center ${
                                    field.value === origin.value ? 'selected' : ''
                                  }`}
                                  onClick={() => field.onChange(origin.value)}
                                >
                                  <div className="text-2xl mb-2">{origin.flag}</div>
                                  <div className="font-medium text-sm">{origin.label}</div>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Number of Names */}
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-semibold">
                          Number of Names: <span className="text-secondary">{numberOfNames}</span>
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-4">
                            <Slider
                              min={1}
                              max={6}
                              step={1}
                              value={[numberOfNames]}
                              onValueChange={(value) => {
                                setNumberOfNames(value[0]);
                                field.onChange(value[0]);
                              }}
                              className="slider"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground px-2">
                              {[1, 2, 3, 4, 5, 6].map(num => (
                                <span key={num} className={numberOfNames === num ? 'text-primary font-bold' : ''}>{num}</span>
                              ))}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Include Surnames */}
                  <FormField
                    control={form.control}
                    name="randomsurname"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between bg-muted/30 p-4 rounded-xl">
                        <FormLabel className="text-lg font-semibold">Include surnames</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Generate Button */}
                  <Button
                    type="submit"
                    disabled={generateNamesMutation.isPending}
                    className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 transform hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl py-6 text-xl font-bold rounded-2xl"
                  >
                    {generateNamesMutation.isPending ? (
                      <>
                        <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                        Generating Names...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-6 h-6 mr-3" />
                        Generate Amazing Names
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </div>
        </Card>

        {/* Results Area */}
        {generatedNames.length > 0 && (
          <Card className="mb-8 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">Generated Names</CardTitle>
              <Button
                variant="outline"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={generateNamesMutation.isPending}
                className="border-primary text-primary hover:bg-primary hover:text-white"
              >
                Generate Another
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generatedNames.map((nameData, index) => (
                  <div
                    key={`${nameData.name}-${index}`}
                    className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 border border-slate-200 dark:border-slate-600"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
                        {nameData.name}
                      </h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(nameData.name)}
                          className="p-2 text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-600"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => saveName(nameData)}
                          disabled={isNameSaved(nameData.name)}
                          className={`p-2 transition-colors ${
                            isNameSaved(nameData.name)
                              ? 'text-red-500'
                              : 'text-slate-500 hover:text-red-500'
                          } hover:bg-white dark:hover:bg-slate-600`}
                          title="Save name"
                        >
                          <Heart className={`w-4 h-4 ${isNameSaved(nameData.name) ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    {nameData.meaning && (
                      <p className="text-slate-600 dark:text-slate-300 text-sm">
                        {nameData.meaning}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Saved Names */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Saved Names</CardTitle>
          </CardHeader>
          <CardContent>
            {savedNames.length === 0 ? (
              <p className="text-slate-500 text-sm">
                No saved names yet. Click the heart icon on generated names to save them!
              </p>
            ) : (
              <div className="space-y-2">
                {savedNames.map((saved, index) => (
                  <div
                    key={`${saved.name}-${saved.savedAt}`}
                    className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700 rounded-lg"
                  >
                    <div>
                      <span className="font-medium text-slate-800 dark:text-slate-100">
                        {saved.name}
                      </span>
                      {saved.meaning && (
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {saved.meaning}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSavedName(index)}
                      className="p-1 text-slate-400 hover:text-red-500"
                      title="Remove from saved"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Section */}
        <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 mb-8 border border-slate-200 dark:border-slate-600">
          <CardContent className="p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-4">How to Use</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Perfect For:</h3>
                <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-1">
                  <li>• Writers creating characters</li>
                  <li>• Expecting parents finding inspiration</li>
                  <li>• Game developers naming NPCs</li>
                  <li>• Content creators needing pseudonyms</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-slate-700 dark:text-slate-200 mb-2">Features:</h3>
                <ul className="text-slate-600 dark:text-slate-300 text-sm space-y-1">
                  <li>• Filter by gender and culture</li>
                  <li>• Get name meanings when available</li>
                  <li>• Copy names with one click</li>
                  <li>• Save favorites locally</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-slate-600 dark:text-slate-300 text-sm">
            Powered by{" "}
            <a
              href="https://www.behindthename.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Behind the Name
            </a>{" "}
            API
          </p>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-2">
            Name meanings and origins provided by Behind the Name database
          </p>
        </div>
      </footer>

      {/* Copy Toast */}
      {showCopyToast && (
        <div className="fixed top-4 right-4 bg-success text-white px-4 py-2 rounded-lg shadow-lg z-50 transform transition-transform duration-300">
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Copied to clipboard!
          </span>
        </div>
      )}
    </div>
  );
}
