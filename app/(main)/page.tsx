"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  Users,
  Heart,
  Globe,
  HandHeart,
  Sparkles,
  ArrowRightIcon,
} from "lucide-react";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import { Highlighter } from "@/components/ui/highlighter";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { useConvexAuth } from "convex/react";
import PricingPage from "@/components/pricing";

const reviews = [
  {
    icon: "Heart",
    title: "Mission",
    titleAccordion: "Notre Mission",
    description:
      "Créer un pont entre les Malagasy vivant en Allemagne et ceux restés au pays, facilitant l'intégration et le partage d'expériences.",
  },
  {
    icon: "Globe",
    title: "Vision",
    titleAccordion: "Notre Vision",
    description:
      "Devenir la référence pour la communauté Malagasy en Allemagne, un espace d'entraide et de croissance mutuelle.",
  },
  {
    icon: "HandHeart",
    title: "Valeurs",
    titleAccordion: "Nos Valeurs",
    description:
      "Solidarité, partage et entraide. La force de la communauté pour surmonter ensemble les défis de l'expatriation.",
  },
  {
    icon: "Users",
    title: "Engagement",
    titleAccordion: "Notre Engagement",
    description:
      "Offrir une solution pratique pour faciliter l'épanouissement de chaque membre, en simplifiant son quotidien et en ouvrant des opportunités.",
  },
  {
    icon: "Sparkles",
    title: "Identité",
    titleAccordion: "Notre Identité",
    description:
      "Préserver et célébrer la culture Malagasy tout en embrassant la diversité allemande, pour représenter fièrement notre pays.",
  },
];

function HomePageContent() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  return (
    <div className="min-h-screen overflow-hidden flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full flex flex-col items-center justify-center gap-4 py-20 h-auto">
        <div className="text-center p-4 max-w-4xl mx-auto">
          <h1 className={`text-5xl md:text-7xl font-bold sm:mb-6 mb-3 pt-20`}>
            Hallo Hallo
          </h1>
          <p className="md:text-xl mb-8 text-muted-foreground leading-relaxed">
            Nous sommes une communauté dédiée aux réseautages entre natif et
            diaspora Malagasy en Allemagne . Une plateforme d&apos;échange et de
            partage pour favoriser l&apos;entraide entre les jeunes expats de
            Madagascar.
          </p>

          {isLoading ? (
            <Link
              href="/"
              className="z-10 opacity-0 flex items-center justify-center"
            >
              <InteractiveHoverButton className="bg-card/90 shadow-sm hover:shadow-xl">
                ...
              </InteractiveHoverButton>
            </Link>
          ) : isAuthenticated ? (
            <div className="space-y-4 opacity-100">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/communaute"
                  className="z-10 flex items-center justify-center"
                >
                  <div
                    className={cn(
                      "group rounded-full border border-border bg-card/90 text-base text-card-foreground transition-all ease-in hover:cursor-pointer hover:bg-accent/80 backdrop-blur-sm shadow-sm hover:shadow-xl",
                    )}
                  >
                    <AnimatedShinyText className="inline-flex items-center justify-center px-6 py-3 transition ease-out hover:text-accent-foreground hover:duration-300">
                      <Users className="mr-2 h-4 w-4" />
                      <span>Voir la communauté</span>
                      <ArrowRightIcon className="ml-2 size-4 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
                    </AnimatedShinyText>
                  </div>
                </Link>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="z-10 flex items-center justify-center"
            >
              <InteractiveHoverButton className="bg-card/90 shadow-sm hover:shadow-xl">
                Se connecter
              </InteractiveHoverButton>
            </Link>
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="py-8 sm:py-12 md:py-16 px-4 shrink-0">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl text-center mb-12">
            <Highlighter action="underline" color="#FF9800">
              Nos Services :
            </Highlighter>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Communauté */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl">Communauté</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Connectez-vous avec d&apos;autres Malagasy en Allemagne et
                  créez des liens durables au sein de notre communauté.
                </p>
              </CardContent>
              <CardFooter className="mt-auto pt-4 w-full">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start pl-0 hover:bg-transparent hover:text-primary group"
                >
                  <Link
                    href="/communaute"
                    className="inline-flex items-center gap-2"
                  >
                    Découvrir
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Opportunités */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl">Opportunités</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trouvez des opportunités d&apos;emploi et de formation
                  adaptées à votre profil et vos ambitions professionnelles.
                </p>
              </CardContent>
              <CardFooter className="mt-auto pt-4 w-full">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start pl-0 hover:bg-transparent hover:text-primary group"
                >
                  <Link href="/jobs" className="inline-flex items-center gap-2">
                    Explorer
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Immobilier */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="text-xl">Immobilier</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Partagez et trouvez des logements facilement grâce à notre
                  réseau de confiance au sein de la communauté.
                </p>
              </CardContent>
              <CardFooter className="mt-auto pt-4 w-full">
                <Button
                  asChild
                  variant="ghost"
                  className="w-full justify-start pl-0 hover:bg-transparent hover:text-primary group"
                >
                  <Link
                    href="/immobilier"
                    className="inline-flex items-center gap-2"
                  >
                    Voir les annonces
                    <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
      {/* About Us Section */}
      <section className="py-8 sm:py-12  bg-secondary md:py-16 px-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl text-center mb-12">
            <Highlighter action="underline" color="#FF9800">
              À Propos de Nous :
            </Highlighter>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.slice(0, 4).map((review) => {
              const iconMap = {
                Heart,
                Globe,
                HandHeart,
                Users,
                Sparkles,
              };
              const IconComponent =
                iconMap[review.icon as keyof typeof iconMap];

              return (
                <Item key={review.icon} variant="default">
                  <ItemMedia variant="icon">
                    {IconComponent && (
                      <IconComponent className="h-5 w-5 text-primary" />
                    )}
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle>{review.titleAccordion}</ItemTitle>
                    <ItemDescription>{review.description}</ItemDescription>
                  </ItemContent>
                </Item>
              );
            })}
          </div>
        </div>
        {/* <CTApricing /> */}
      </section>
      <PricingPage />
    </div>
  );
}

function HomePageSkeleton() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero Section Skeleton */}
      <section className="relative h-[80vh] w-full flex items-center justify-center">
        <div className="text-center p-4 max-w-4xl mx-auto">
          <div className="h-20 md:h-24 bg-muted rounded-lg mb-6 w-3/4 mx-auto"></div>
          <div className="space-y-3 mb-8">
            <div className="h-6 bg-muted rounded w-full"></div>
            <div className="h-6 bg-muted rounded w-5/6 mx-auto"></div>
            <div className="h-6 bg-muted rounded w-4/5 mx-auto"></div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div className="h-14 bg-muted rounded-lg w-48"></div>
            <div className="h-14 bg-muted rounded-lg w-48"></div>
          </div>
        </div>
      </section>

      {/* Services Section Skeleton */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-12 bg-muted rounded-lg mb-12 w-64 mx-auto"></div>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="flex flex-col">
                <CardHeader>
                  <div className="h-12 w-12 bg-muted rounded mb-4"></div>
                  <div className="h-6 bg-muted rounded w-2/3"></div>
                  <div className="space-y-2 mt-2">
                    <div className="h-4 bg-muted rounded w-full"></div>
                    <div className="h-4 bg-muted rounded w-4/5"></div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex items-end">
                  <div className="h-10 bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomePageSkeleton />}>
      <HomePageContent />
    </Suspense>
  );
}
