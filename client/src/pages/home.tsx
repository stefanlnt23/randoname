import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateNamesSchema, type GenerateNamesRequest, type NameData, type SavedName, type SearchNameRequest, type RelatedNamesRequest, type NameOriginRequest } from "@shared/schema";
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
import { Input } from "@/components/ui/input";
import { Copy, Heart, X, Zap, Loader2, Sparkles, Info, Menu, Search, BookOpen, Users, ChevronDown, ChevronUp, Filter, Globe, MapPin } from "lucide-react";

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
  const [numberOfNames, setNumberOfNames] = useState<number>(3);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedName, setSelectedName] = useState<NameData | null>(null);
  const [relatedNames, setRelatedNames] = useState<string[]>([]);
  const [expandedNameMeanings, setExpandedNameMeanings] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const form = useForm<GenerateNamesRequest>({
    resolver: zodResolver(generateNamesSchema),
    defaultValues: {
      gender: '',
      usage: 'eng',
      number: 3
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

  const lookupNameMutation = useMutation({
    mutationFn: async (data: SearchNameRequest) => {
      const response = await apiRequest('POST', '/api/lookup-name', data);
      return response.json();
    },
    onSuccess: (data: NameData) => {
      setSelectedName(data);
      // Update the generated names array with the meaning if it exists
      setGeneratedNames(prev => prev.map(name => 
        name.name.toLowerCase() === data.name.toLowerCase() 
          ? { ...name, meaning: data.meaning, etymology: data.etymology, gender: data.gender }
          : name
      ));
    },
    onError: (error) => {
      toast({
        title: "Name lookup failed",
        description: error instanceof Error ? error.message : "Could not find information for this name.",
        variant: "destructive"
      });
    }
  });

  const relatedNamesMutation = useMutation({
    mutationFn: async (data: RelatedNamesRequest) => {
      const response = await apiRequest('POST', '/api/related-names', data);
      return response.json();
    },
    onSuccess: (data) => {
      setRelatedNames(data.relatedNames || []);
    },
    onError: (error) => {
      toast({
        title: "Related names lookup failed",
        description: error instanceof Error ? error.message : "Could not find related names.",
        variant: "destructive"
      });
    }
  });

  const searchNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest('POST', '/api/lookup-name', { name, exact: false });
      return response.json();
    },
    onSuccess: (data: NameData) => {
      setGeneratedNames([data]);
      setSelectedName(data);
    },
    onError: (error) => {
      toast({
        title: "Search failed",
        description: error instanceof Error ? error.message : "Could not find the searched name.",
        variant: "destructive"
      });
    }
  });

  const nameOriginMutation = useMutation({
    mutationFn: async (data: NameOriginRequest) => {
      const response = await apiRequest('POST', '/api/name-origin', data);
      return response.json();
    },
    onSuccess: (originData, variables) => {
      // Update the generated names array with origin data
      const nameToUpdate = variables.firstName || variables.lastName || '';
      setGeneratedNames(prev => prev.map(name => 
        name.name.toLowerCase() === nameToUpdate.toLowerCase() 
          ? { ...name, originData }
          : name
      ));
    },
    onError: (error) => {
      toast({
        title: "Origin lookup failed",
        description: error instanceof Error ? error.message : "Could not find origin information for this name.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: GenerateNamesRequest) => {
    generateNamesMutation.mutate(data);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Spacebar to generate names (only if not typing in input)
      if (event.code === 'Space' && event.target === document.body) {
        event.preventDefault();
        const formData = form.getValues();
        generateNamesMutation.mutate(formData);
      }
      
      // Escape to clear search
      if (event.code === 'Escape') {
        setSearchQuery('');
        setSelectedName(null);
        setRelatedNames([]);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [form, generateNamesMutation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchNameMutation.mutate(searchQuery.trim());
    }
  };

  const lookupNameMeaning = (name: string) => {
    lookupNameMutation.mutate({ name, exact: false });
  };

  const findRelatedNames = (name: string, usage?: string, gender?: string) => {
    relatedNamesMutation.mutate({ name, usage, gender });
  };

  const fetchNameOrigin = (name: string) => {
    // Try to determine if it's a first name or last name
    // For now, treat single names as first names
    nameOriginMutation.mutate({ firstName: name });
  };

  const toggleNameMeaning = (name: string) => {
    const newExpanded = new Set(expandedNameMeanings);
    if (newExpanded.has(name)) {
      newExpanded.delete(name);
    } else {
      newExpanded.add(name);
      // Fetch meaning if not already available
      const nameData = generatedNames.find(n => n.name === name);
      if (nameData && !nameData.meaning) {
        lookupNameMeaning(name);
      }
      // Also fetch origin data if not available
      if (nameData && !nameData.originData) {
        fetchNameOrigin(name);
      }
    }
    setExpandedNameMeanings(newExpanded);
  };

  const copyToClipboard = async (name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      toast({
        title: "Copied to clipboard!",
        description: `"${name}" is ready to paste`,
        duration: 2000,
      });
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = name;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({
        title: "Copied to clipboard!",
        description: `"${name}" is ready to paste`,
        duration: 2000,
      });
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
              <span className="flex items-center gap-2">
                <Copy className="w-4 h-4 text-primary" />
                Copy Names
              </span>
            </div>
            <div className="mt-6 text-xs text-muted-foreground/70 text-center">
              <kbd className="px-2 py-1 bg-muted/50 rounded text-xs">Space</kbd> to generate • 
              <kbd className="px-2 py-1 bg-muted/50 rounded text-xs ml-1">Esc</kbd> to clear search
            </div>
          </div>
        </div>
      </header>

      {/* Search Section */}
      <section className="max-w-4xl mx-auto px-4 py-6">
        <Card className="border-2 shadow-lg bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a specific name..."
                  className="pl-10 h-12 text-base border-2 focus:border-primary transition-colors"
                />
              </div>
              <Button 
                type="submit" 
                disabled={searchNameMutation.isPending || !searchQuery.trim()}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 transition-all duration-300"
              >
                {searchNameMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>


            {/* Three Column Layout - Mobile Responsive */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {/* Left Column: Cultural Origins */}
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm order-1 md:order-1 lg:order-1">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                    <Info className="w-5 h-5 text-primary" />
                    Cultural Origins
                  </CardTitle>
                  <p className="text-xs text-center text-muted-foreground">
                    Choose a cultural background for names
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
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
                                  title={`Select ${origin.label} names`}
                                  className={`cultural-origin-btn w-full p-3 rounded-xl border-2 cursor-pointer text-center transition-all duration-300 hover:scale-105 hover:shadow-md min-h-[72px] flex flex-col justify-center ${
                                    field.value === origin.value 
                                      ? 'border-primary bg-gradient-to-br from-primary/20 via-primary/15 to-secondary/20 text-primary shadow-lg ring-2 ring-primary/30' 
                                      : 'border-border hover:border-primary/50 hover:bg-primary/5'
                                  }`}
                                >
                                  <div className="text-xl mb-1">{origin.flag}</div>
                                  <div className="font-medium text-xs leading-tight">{origin.label}</div>
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
              </Card>

              {/* Center Column: Controls and Generate Button */}
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm order-2 md:order-2 lg:order-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 text-secondary" />
                    Settings
                  </CardTitle>
                  <p className="text-xs text-center text-muted-foreground">
                    Customize your name preferences
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gender Selection */}
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium mb-3 block">Gender</FormLabel>
                        <div className="grid grid-cols-1 gap-2">
                          <div className="flex items-center">
                            <input
                              type="radio"
                              value=""
                              id="any-center"
                              checked={field.value === ""}
                              onChange={() => field.onChange("")}
                              className="sr-only peer"
                            />
                            <Label
                              htmlFor="any-center"
                              className="w-full px-4 py-2 rounded-lg border-2 border-border cursor-pointer peer-checked:border-primary peer-checked:bg-gradient-to-r peer-checked:from-primary/20 peer-checked:to-secondary/20 peer-checked:text-primary transition-all duration-300 hover:border-primary/50 font-medium text-center"
                            >
                              Any Gender
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              value="m"
                              id="male-center"
                              checked={field.value === "m"}
                              onChange={() => field.onChange("m")}
                              className="sr-only peer"
                            />
                            <Label
                              htmlFor="male-center"
                              className="w-full px-4 py-2 rounded-lg border-2 border-border cursor-pointer peer-checked:border-primary peer-checked:bg-gradient-to-r peer-checked:from-primary/20 peer-checked:to-secondary/20 peer-checked:text-primary transition-all duration-300 hover:border-primary/50 font-medium text-center"
                            >
                              Male
                            </Label>
                          </div>
                          <div className="flex items-center">
                            <input
                              type="radio"
                              value="f"
                              id="female-center"
                              checked={field.value === "f"}
                              onChange={() => field.onChange("f")}
                              className="sr-only peer"
                            />
                            <Label
                              htmlFor="female-center"
                              className="w-full px-4 py-2 rounded-lg border-2 border-border cursor-pointer peer-checked:border-primary peer-checked:bg-gradient-to-r peer-checked:from-primary/20 peer-checked:to-secondary/20 peer-checked:text-primary transition-all duration-300 hover:border-primary/50 font-medium text-center"
                            >
                              Female
                            </Label>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Number of Names */}
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-3">
                          <FormLabel className="text-sm font-medium">
                            Number of Names
                          </FormLabel>
                          <span className="text-lg font-bold text-primary bg-primary/10 px-3 py-1 rounded-lg">
                            {field.value}
                          </span>
                        </div>
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
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>1</span>
                          <span>10</span>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  {/* Generate Button */}
                  <Button 
                    type="submit" 
                    disabled={generateNamesMutation.isPending}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-md"
                  >
                    {generateNamesMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Names...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Amazing Names
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Right Column: Generated Names */}
              <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-card/95 to-card/80 backdrop-blur-sm order-3 md:col-span-2 md:order-3 lg:col-span-1 lg:order-3">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg text-center flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Generated Names
                  </CardTitle>
                  <p className="text-xs text-center text-muted-foreground">
                    Your personalized name suggestions
                  </p>
                </CardHeader>
                <CardContent>
                  {generatedNames.length === 0 ? (
                    <div className="text-center py-12">
                      <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground text-lg mb-2 font-medium">No names generated yet</p>
                      <p className="text-muted-foreground/70 text-sm leading-relaxed">
                        Select your preferences and click generate to discover amazing names!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {generatedNames.map((nameData, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-background/80 to-muted/30 p-5 rounded-xl border-2 border-border/50 hover:border-primary/40 hover:shadow-xl transition-all duration-300 group"
                        >
                          {/* Name Header */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="font-bold text-2xl text-foreground group-hover:text-primary transition-colors duration-300 mb-1">
                                {nameData.name}
                              </h3>
                              {nameData.usage && (
                                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                                  {nameData.usage}
                                </span>
                              )}
                            </div>
                            <div className="flex gap-2 opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  copyToClipboard(nameData.name);
                                }}
                                title="Copy to clipboard"
                                className="text-muted-foreground hover:text-secondary hover:bg-background/50 h-8 w-8 p-0"
                                type="button"
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  saveName(nameData);
                                }}
                                title={isNameSaved(nameData.name) ? "Remove from favorites" : "Add to favorites"}
                                className={`transition-colors duration-300 h-8 w-8 p-0 ${
                                  isNameSaved(nameData.name)
                                    ? 'text-accent hover:text-accent/80'
                                    : 'text-muted-foreground hover:text-accent'
                                } hover:bg-background/50`}
                                type="button"
                              >
                                <Heart className={`w-4 h-4 ${isNameSaved(nameData.name) ? 'fill-current' : ''}`} />
                              </Button>
                            </div>
                          </div>
                          
                          {/* Expandable Meaning Section */}
                          {expandedNameMeanings.has(nameData.name) && (
                            <div className="border-t border-border/30 pt-4 mt-4 space-y-3">
                              {nameData.meaning && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-primary" />
                                    Meaning
                                  </h4>
                                  <p className="text-muted-foreground text-sm leading-relaxed bg-muted/30 p-3 rounded-lg">
                                    {nameData.meaning}
                                  </p>
                                </div>
                              )}
                              {nameData.etymology && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Etymology</h4>
                                  <p className="text-muted-foreground text-sm leading-relaxed">
                                    {nameData.etymology}
                                  </p>
                                </div>
                              )}
                              {nameData.gender && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2">Gender</h4>
                                  <span className="text-muted-foreground text-sm bg-primary/10 px-2 py-1 rounded">
                                    {nameData.gender === 'm' ? 'Masculine' : nameData.gender === 'f' ? 'Feminine' : nameData.gender}
                                  </span>
                                </div>
                              )}
                              {nameData.originData && (
                                <div>
                                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-primary" />
                                    Origin
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground font-medium">Country:</span>
                                      <span className="text-sm bg-primary/10 px-2 py-1 rounded">
                                        {nameData.originData.countryOrigin}
                                      </span>
                                      {nameData.originData.countryOriginAlt && (
                                        <span className="text-sm bg-secondary/10 px-2 py-1 rounded">
                                          {nameData.originData.countryOriginAlt}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground font-medium">Region:</span>
                                      <span className="text-sm text-muted-foreground">
                                        {nameData.originData.regionOrigin}
                                      </span>
                                    </div>
                                    {nameData.originData.subRegionOrigin && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground font-medium">Sub-region:</span>
                                        <span className="text-sm text-muted-foreground">
                                          {nameData.originData.subRegionOrigin}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-muted-foreground font-medium">Confidence:</span>
                                      <span className="text-sm text-muted-foreground">
                                        {nameData.originData.probabilityCalibrated > 0 
                                          ? `${Math.round(nameData.originData.probabilityCalibrated * 100)}%`
                                          : 'Calibrating...'
                                        }
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>

        {/* Related Names Section */}
        {relatedNames.length > 0 && (
          <Card className="mb-8 border-2 border-secondary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent flex items-center gap-2">
                <Users className="w-6 h-6 text-secondary" />
                Related Names
              </CardTitle>
              <p className="text-muted-foreground">Names similar to your selection</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {relatedNames.map((relatedName, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-background/60 to-muted/20 p-3 rounded-lg border border-border/50 hover:border-secondary/50 hover:shadow-md transition-all duration-300 group cursor-pointer"
                    onClick={() => searchNameMutation.mutate(relatedName)}
                  >
                    <span className="font-medium text-foreground group-hover:text-secondary transition-colors duration-300">
                      {relatedName}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

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