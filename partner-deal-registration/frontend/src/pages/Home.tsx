import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/ui/animated-hero";
import { Clock, Shield, Zap, Users, CheckCircle } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";

const features = [
  {
    icon: Clock,
    title: "Under 3 Minutes",
    description: "Streamlined registration process reduces submission time from 15 minutes to under 3 minutes."
  },
  {
    icon: Shield,
    title: "Duplicate Detection",
    description: "Real-time duplicate checking prevents channel conflicts before they happen."
  },
  {
    icon: Zap,
    title: "Auto-save & Recovery",
    description: "Never lose your progress with automatic saving and draft recovery capabilities."
  },
  {
    icon: Users,
    title: "Smart Routing",
    description: "Intelligent approval routing based on deal value, territory, and compliance requirements."
  }
];

const steps = [
  {
    number: "01",
    title: "Quick Check",
    description: "Start with customer name and domain for instant duplicate detection."
  },
  {
    number: "02",
    title: "Core Information",
    description: "Provide essential partner and customer details with smart auto-fill."
  },
  {
    number: "03",
    title: "Deal Intelligence",
    description: "Define opportunity scope, products, and technical requirements."
  },
  {
    number: "04",
    title: "Review & Submit",
    description: "Final review and submission with automated approval routing."
  }
];

const stats = [
  { value: "3 min", label: "Average Registration Time" },
  { value: "98%", label: "Partner Adoption Rate" },
  { value: "48 hrs", label: "Average Approval Time" },
  { value: "95%", label: "Duplicate Prevention Rate" }
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Partners Choose Our System
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built for speed, security, and simplicity. Everything you need to manage your deal registrations efficiently.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-normal bg-gradient-card">
                <CardHeader className="text-center pb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Simple 4-Step Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our streamlined workflow guides you through each step with intelligent assistance and real-time validation.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6 group">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">
                      {step.number}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Deal Registration?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join hundreds of partners already using our system to register deals faster and more efficiently.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="xl" asChild>
              <a href="/register">Start Registration</a>
            </Button>
            <Button variant="outline" size="xl" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent" asChild>
              <a href="/auth">Partner Login</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-bold text-foreground">Daxa</span>
              <span className="text-muted-foreground ml-2">Partner Portal</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="/support" className="hover:text-foreground transition-colors">Support</a>
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;