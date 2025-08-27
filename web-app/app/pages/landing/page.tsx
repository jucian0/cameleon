import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Workflow,
  Library,
  Zap,
  Users,
  Shield,
  Code2,
  Github,
  Star,
} from "lucide-react";
import { Link } from "react-router";

const metadata = {
  title: "Cameleon - Visual Studio for Apache Camel",
  description:
    "Cameleon is a free, open-source studio for creating, organizing, and sharing Camel routes. Build workflows visually or with code, generate Camel DSL, and keep your integrations structured — without managing infrastructure.",
  githubUrl: "https://github.com/jucian0/cameleon",
};

export function meta() {
  return [
    { title: metadata.title },
    { name: "description", content: metadata.description },
  ];
}

// Reusable components
const OpenSourceBadge = () => (
  <Badge className="bg-green-500/20 text-green-600 hover:bg-green-500/30 border-green-500/30">
    <Star className="h-3 w-3 mr-1 fill-green-600" />
    Free & Open Source
  </Badge>
);

const GitHubButton = ({
  size = "lg",
  variant = "outline",
  children,
  ...props
}: any) => (
  <a
    href={metadata.githubUrl}
    target="_blank"
    rel="noopener noreferrer"
    {...props}
  >
    <Button
      intent={variant as any}
      size={size as any}
      className={
        variant === "outline" ? "bg-background/50 hover:bg-accent" : ""
      }
    >
      <Github className="mr-2 h-5 w-5" />
      {children}
    </Button>
  </a>
);

const FeatureCard = ({ icon: Icon, title, description }: any) => (
  <Card className="bg-card/50 border-border/50 hover:bg-card/70 transition-all duration-300">
    <CardHeader>
      <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4">
        <Icon className="h-6 w-6 text-primary-foreground" />
      </div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
  </Card>
);

const UseCaseCard = ({ icon: Icon, title, description }: any) => (
  <div className="text-center space-y-4">
    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
      <Icon className="h-8 w-8 text-primary-foreground" />
    </div>
    <h4 className="text-xl font-semibold text-foreground">{title}</h4>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const SectionHeader = ({ badge, title, description, className = "" }: any) => (
  <div className={`text-center mb-16 ${className}`}>
    {badge && (
      <Badge intent="outline" className="mb-2 text-xs">
        {badge}
      </Badge>
    )}
    <h3 className="text-3xl font-bold text-foreground mb-4">{title}</h3>
    {description && (
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
        {description}
      </p>
    )}
  </div>
);

const Logo = ({ size = 8 }) => (
  <div className={`w-${size} h-${size}`}>
    <svg
      viewBox="0 0 31.637 31.637"
      className="w-full h-full"
      fill="currentColor"
    >
      <circle cx="7.676" cy="7.067" r="0.827" />
      <path d="M21.841,4.244c-4-1.012-7.198-0.758-11.431,1.771c-0.097-0.924-2.53-3.697-5.497-1.75 C1.751,3.874,1.751,7.134,1.751,7.134S0.023,10.173,0,11.318c-0.016,0.766,0.446,0.973,0.888,1.105 c2.285-1.301,4.359-0.992,6.044-0.74c0.878,0.131,1.639,0.242,2.208,0.082c0.197-0.057,0.404,0.06,0.46,0.258 c0.056,0.197-0.06,0.404-0.257,0.461c-0.724,0.203-1.557,0.08-2.521-0.064c-1.508-0.225-3.35-0.486-5.328,0.535 c1.878,3.272,7.082,4.382,10.862,1.769c0.825,0.052,1.907,0.175,3.074,0.271c0.215,0.017,0.004,0.697-0.205,1.375 c-0.073,0.236-2.863,0.82-2.918,1.027c-0.101,0.389,2.537,0.072,2.725,0.341c0.187,0.271-0.34,1.509-0.097,2.094 c0.162,0.389,1.48-0.011,1.849-0.926c0.186-0.456-0.593-1.359-0.42-1.722c0.52-1.083,0.974-2.073,1.055-2.071 c0.541,0.017,1.08,0.018,1.604-0.007c1.092-0.05,2.146-0.152,3.122-0.237c0.124-0.011,0.332,0.425,0.552,0.933 c0.1,0.232-1.828,0.584-1.729,0.812c0.203,0.466,1.897,0.152,2.529,0.734c0.633,0.584,0.653,2.156,1.119,2.336 c0.257,0.099,1.334-0.674,1.119-1.654c-0.314-1.43-2.036-3.274-1.946-3.278c1.195-0.055,2.188,0.002,2.87,0.355 c2.53,1.309,0.682,11.047-5.643,11.535c-3.445,0.265-4.596-2.491-4.168-4.028c0.423-1.519,2.319-2.345,3.634-2.148 c1.312,0.192,1.556,1.41,0.973,2.235c-0.077,0.109-0.166,0.21-0.261,0.304c-0.226-0.229-0.538-0.371-0.884-0.371 c-0.687,0-1.242,0.557-1.242,1.242c0,0.687,0.556,1.241,1.242,1.241c0.62,0,1.13-0.455,1.223-1.052 c0.334-0.083,0.664-0.245,0.944-0.536c1.118-1.168,0.875-3.26-1.244-3.978c-2.371-0.802-5.694,0.688-5.792,3.218 c-0.097,2.529,2.224,5.496,6.221,5.268c5.935-0.342,10.204-6.504,9.965-12.192C31.421,11.026,28.847,6.015,21.841,4.244z M6.922,9.713c-1.33,0-2.408-1.078-2.408-2.408c0-1.33,1.078-2.408,2.408-2.408c1.329,0,2.407,1.078,2.407,2.408 C9.33,8.635,8.252,9.713,6.922,9.713z" />
    </svg>
  </div>
);

const GitHubLink = ({ children, ...props }: any) => (
  <a
    href={metadata.githubUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="hover:text-foreground transition-colors text-sm text-muted-foreground"
    {...props}
  >
    {children}
  </a>
);

export default function Landing() {
  const features = [
    {
      icon: Workflow,
      title: "Visual Workflow Builder",
      description:
        "Drag-and-drop to design Camel routes and integration patterns. Free and open for everyone.",
    },
    {
      icon: Code2,
      title: "Dual Editing",
      description:
        "Switch between visual design and code editing seamlessly. Open source and extensible.",
    },
    {
      icon: Zap,
      title: "Code & YAML Export",
      description:
        "Generate Apache Camel Java DSL or YAML directly from workflows. No locked-in formats.",
    },
    {
      icon: Library,
      title: "Reusable Templates",
      description:
        "Save workflows as presets and reuse integration patterns. Community templates welcome!",
    },
    {
      icon: Users,
      title: "Community Collaboration",
      description:
        "Share workflows with your team and the community. Open source means better together.",
    },
    {
      icon: Shield,
      title: "Powered by Apache Camel",
      description:
        "Work natively with the Camel ecosystem and EIP standards. Open integration excellence.",
    },
  ];

  const useCases = [
    {
      icon: Workflow,
      title: "Prototype Integrations",
      description:
        "Quickly sketch and validate integration ideas visually. Free forever.",
    },
    {
      icon: Library,
      title: "Document Flows",
      description:
        "Create visual blueprints for integration projects and share with your team. No paywalls.",
    },
    {
      icon: Code2,
      title: "Generate Camel DSL",
      description:
        "Export YAML or Java DSL to jump-start your production routes. Open format.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Navigation */}
      <nav className="border-b border-border/40 backdrop-blur-sm bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Logo size={8} />
              <h1 className="text-xl font-bold text-foreground">Cameleon</h1>
            </div>
            <div className="flex items-center space-x-4">
              <GitHubLink className="flex items-center">
                <Github className="h-4 w-4 mr-1" />
                Star on GitHub
              </GitHubLink>
              <Link to="/app">
                <Button
                  intent="outline"
                  className="bg-background/50 hover:bg-accent"
                >
                  Open Studio
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
                <Badge intent="secondary" className="text-sm">
                  {metadata.title}
                </Badge>
                <OpenSourceBadge />
              </div>
              <h2 className="text-5xl font-bold text-foreground leading-tight">
                Design & Save Apache Camel
                <span className="block text-transparent bg-clip-text bg-gradient-primary">
                  Integrations Visually
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                {metadata.description}
              </p>
              <p className="text-muted-foreground text-sm">
                Proudly built on open standards and community-driven development
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                >
                  <Workflow className="mr-2 h-5 w-5" />
                  Start Building Free
                </Button>
              </Link>
              <GitHubButton size="lg">Star on GitHub</GitHubButton>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-card/20">
        <div className="container mx-auto px-4">
          <SectionHeader
            badge="OPEN SOURCE POWERED"
            title="Focused on What Matters: Building Camel Integrations"
            description="Free and open source. Cameleon gives you the tools to design, visualize, and export integrations — the community-driven way to build with Apache Camel."
          />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Built for Developers & Architects"
            description="Whether you're prototyping, documenting, or preparing production-ready routes, Cameleon accelerates the way you design with Camel - completely free and open source."
          />

          <div className="grid md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <UseCaseCard
                key={index}
                icon={useCase.icon}
                title={useCase.title}
                description={useCase.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-16 bg-card/20">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Proudly Open Source"
            description="Cameleon is built by and for the Apache Camel community. Free to use, modify, and contribute to."
          />

          <div className="max-w-3xl mx-auto bg-card p-8 rounded-xl border">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center mb-6">
                <Github className="h-8 w-8 text-primary-foreground" />
              </div>
              <h4 className="text-2xl font-semibold text-foreground mb-4">
                Join Our Growing Community
              </h4>
              <p className="text-muted-foreground mb-6">
                Star us on GitHub, report issues, suggest features, or
                contribute code. Together we can make Camel development better
                for everyone.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GitHubButton className="bg-foreground text-background hover:bg-foreground/90">
                  Star on GitHub
                </GitHubButton>
                <a
                  href={`${metadata.githubUrl}/issues`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button intent="outline">Contribute</Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary/10">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <Badge intent="outline" className="text-sm">
              FREE FOREVER
            </Badge>
            <h3 className="text-4xl font-bold text-foreground">
              Ready to Start Designing Your Camel Routes?
            </h3>
            <p className="text-xl text-muted-foreground">
              Join developers and architects using Cameleon to simplify
              integration design. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                >
                  <Workflow className="mr-2 h-5 w-5" />
                  Get Started Free
                </Button>
              </Link>
              <GitHubButton size="lg">View Source Code</GitHubButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Logo size={6} />
              <span className="font-medium">Cameleon</span>
            </div>

            <div className="flex items-center space-x-6">
              <GitHubLink>GitHub</GitHubLink>
              <GitHubLink href={`${metadata.githubUrl}/issues`}>
                Issues
              </GitHubLink>
              <GitHubLink href={`${metadata.githubUrl}/blob/main/LICENSE`}>
                License
              </GitHubLink>
            </div>

            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Cameleon. Free and open source.
              Powered by Apache Camel.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
