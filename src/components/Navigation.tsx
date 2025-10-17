import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Menu, X, Sparkles, GraduationCap, BarChart3, Users, BookOpen, Mail, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from 'react-i18next';

const navigationItems = [
  {
    title: "Product",
    items: [
      {
        title: "Features",
        href: "/features",
        description: "Explore AI-powered adaptive learning features",
        icon: Sparkles,
      },
      {
        title: "Collaborative Learning",
        href: "/collaborative-learning",
        description: "Real-time group study with AI facilitation",
        icon: Users,
      },
      {
        title: "Demo",
        href: "/learning-path",
        description: "Try our interactive learning path demo",
        icon: GraduationCap,
      },
      {
        title: "Live Path (KT)",
        href: "/learning-path-viewer",
        description: "Real-time knowledge tracking demo",
        icon: Sparkles,
      },
      {
        title: "Dashboard",
        href: "/dashboard",
        description: "View your learning progress",
        icon: BarChart3,
      },
    ],
  },
  {
    title: "Company",
    items: [
      {
        title: "About",
        href: "/about",
        description: "Learn about our mission and vision",
        icon: BookOpen,
      },
      {
        title: "Impact",
        href: "/impact",
        description: "See the difference we're making",
        icon: BarChart3,
      },
      {
        title: "Team",
        href: "/team",
        description: "Meet the people behind LearnPath AI",
        icon: Users,
      },
    ],
  },
];

const resources = [
  { title: "Documentation", href: "/docs", icon: FileText },
  { title: "Contact", href: "/contact", icon: Mail },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            LearnPath AI
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((group) => (
                  <NavigationMenuItem key={group.title}>
                    <NavigationMenuTrigger className="text-sm font-medium">
                      {group.title}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.title}>
                              <NavigationMenuLink asChild>
                                <Link
                                  to={item.href}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground group",
                                    isActive(item.href) && "bg-accent/50"
                                  )}
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <Icon className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                                    <div className="text-sm font-medium leading-none">
                                      {item.title}
                                    </div>
                                  </div>
                                  <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                    {item.description}
                                  </p>
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          );
                        })}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                ))}

                {/* Resources as simple links */}
                {resources.map((resource) => {
                  const Icon = resource.icon;
                  return (
                    <NavigationMenuItem key={resource.title}>
                      <Link
                        to={resource.href}
                        className={cn(
                          "group inline-flex h-10 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                          isActive(resource.href) && "bg-accent/50"
                        )}
                      >
                        <Icon className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                        {resource.title}
                      </Link>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>

            {/* Language Switcher */}
            <LanguageSwitcher className="ml-4" />

            {/* CTA Button */}
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg ml-4"
            >
              <Link to="/dashboard">{t('actions.getStarted')}</Link>
            </Button>
          </nav>

          {/* Mobile Menu Toggle */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                {mobileOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-6 mt-8">
                <Link
                  to="/"
                  className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                >
                  LearnPath AI
                </Link>

                {navigationItems.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                      {group.title}
                    </h4>
                    <ul className="space-y-2">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        return (
                          <li key={item.title}>
                            <Link
                              to={item.href}
                              className={cn(
                                "flex items-start gap-3 p-3 rounded-lg transition-colors hover:bg-accent group",
                                isActive(item.href) && "bg-accent"
                              )}
                            >
                              <Icon className="h-5 w-5 text-primary mt-0.5 group-hover:scale-110 transition-transform" />
                              <div>
                                <div className="font-medium">{item.title}</div>
                                <p className="text-sm text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}

                <div className="space-y-3 pt-6 border-t border-border">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                    Resources
                  </h4>
                  <ul className="space-y-2">
                    {resources.map((resource) => {
                      const Icon = resource.icon;
                      return (
                        <li key={resource.title}>
                          <Link
                            to={resource.href}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent group",
                              isActive(resource.href) && "bg-accent"
                            )}
                          >
                            <Icon className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                            <span className="font-medium">{resource.title}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Language Switcher (Mobile) */}
                <div className="pt-6 border-t border-border">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                    {t('common.language')}
                  </h4>
                  <LanguageSwitcher className="w-full" />
                </div>

                <Button
                  asChild
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity mt-4"
                >
                  <Link to="/dashboard">{t('actions.getStarted')}</Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

