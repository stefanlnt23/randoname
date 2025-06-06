import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, Shield, Eye, Cookie, Database, Lock } from "lucide-react";

export default function Privacy() {
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
                Privacy Policy
              </h1>
              <p className="text-muted-foreground text-lg mt-2">
                How we protect and handle your information
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 rounded-full bg-gradient-to-r from-primary to-secondary">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl">Your Privacy Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground leading-relaxed">
                This Privacy Policy explains how Random Name Generator collects, uses, and protects your information 
                when you visit our website. Last updated: {new Date().toLocaleDateString()}.
              </p>
            </CardContent>
          </Card>

          {/* Information Collection */}
          <Card className="border-2 border-secondary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Database className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Information We Collect</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Automatically Collected Information</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Browser type and version</li>
                  <li>• Device information and screen resolution</li>
                  <li>• IP address and general location</li>
                  <li>• Pages visited and time spent on site</li>
                  <li>• Referring website information</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Information You Provide</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Contact form submissions (name, email, message)</li>
                  <li>• Feedback and support requests</li>
                  <li>• Names you choose to save locally</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Data Usage */}
          <Card className="border-2 border-accent/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Eye className="w-6 h-6 text-accent" />
                </div>
                <CardTitle className="text-xl">How We Use Your Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• <strong>Service Operation:</strong> To provide and maintain our name generation service</li>
                <li>• <strong>User Experience:</strong> To improve website functionality and user interface</li>
                <li>• <strong>Communication:</strong> To respond to your inquiries and provide support</li>
                <li>• <strong>Analytics:</strong> To understand how visitors use our website</li>
                <li>• <strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Local Storage */}
          <Card className="border-2 border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">Local Storage & Cookies</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Local Storage</h4>
                <p className="text-sm text-muted-foreground">
                  We use your browser's local storage to save names you choose to favorite. This data never leaves 
                  your device and can be cleared by deleting your browser data.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Cookies & Analytics</h4>
                <p className="text-sm text-muted-foreground">
                  We use Google Analytics to understand website usage patterns. Google Analytics may set cookies 
                  to track anonymous usage statistics. You can opt out of Google Analytics tracking.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Third Party Services */}
          <Card className="border-2 border-secondary/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  <Cookie className="w-6 h-6 text-secondary" />
                </div>
                <CardTitle className="text-xl">Third-Party Services</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Behind the Name API</h4>
                <p className="text-sm text-muted-foreground">
                  Our name generation service uses the Behind the Name API. Your name generation requests are sent 
                  to their servers but do not include personally identifiable information.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Google AdSense</h4>
                <p className="text-sm text-muted-foreground">
                  We use Google AdSense to display relevant advertisements. Google may use cookies to show ads 
                  based on your visits to this and other websites. You can opt out of personalized advertising.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="border-2 border-accent/20 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl">Data Protection & Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Data Security</h4>
                <p className="text-sm text-muted-foreground">
                  We implement appropriate security measures to protect your information against unauthorized access, 
                  alteration, disclosure, or destruction.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Your Rights</h4>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• Access your personal information</li>
                  <li>• Correct inaccurate information</li>
                  <li>• Request deletion of your information</li>
                  <li>• Opt out of communications</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="text-center border-2 gradient-border p-1">
            <div className="bg-card rounded-lg p-6">
              <CardTitle className="text-xl mb-4">Questions About Privacy?</CardTitle>
              <p className="text-muted-foreground mb-6">
                If you have any questions about this Privacy Policy or our data practices, please contact us.
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/contact">
                  <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
                    Contact Us
                  </Button>
                </Link>
                <Button variant="outline">
                  <a href="mailto:privacy@randomnamegenerator.app">privacy@randomnamegenerator.app</a>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}