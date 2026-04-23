"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { DynamicIcon, type IconName } from "lucide-react/dynamic";
import Link from "next/link";

type FAQItem = {
  id: string;
  icon: IconName;
  question: string;
  answer: string;
};

export default function FAQsThree() {
  const faqItems: FAQItem[] = [
    {
      id: "item-1",
      icon: "users",
      question: "Comment rejoindre la communauté Malagasy en Allemagne ?",
      answer:
        "Il suffit de créer un compte gratuit sur notre plateforme. Une fois inscrit, vous aurez accès à tous nos services : communauté, offres d'emploi et annonces immobilières. Vous pourrez également participer aux discussions et événements organisés par la communauté.",
    },
    {
      id: "item-2",
      icon: "briefcase",
      question: "Comment publier une offre d'emploi ou postuler ?",
      answer:
        "Les employeurs peuvent publier gratuitement leurs offres d'emploi dans la section 'Emplois'. Les candidats peuvent consulter toutes les offres disponibles et postuler directement via la plateforme. Nous facilitons aussi les recommandations entre membres de la communauté.",
    },
    {
      id: "item-3",
      icon: "home",
      question: "Puis-je proposer un logement ou chercher une colocation ?",
      answer:
        "Absolument ! Notre section 'Immobilier' permet de publier des annonces de location, colocation ou hébergement temporaire. C'est un excellent moyen d'aider les nouveaux arrivants à trouver un logement ou de partager les coûts avec d'autres membres de la communauté.",
    },
    {
      id: "item-4",
      icon: "heart",
      question: "Quels types d'aide puis-je recevoir de la communauté ?",
      answer:
        "Notre communauté offre un soutien dans de nombreux domaines : conseils pour les démarches administratives, aide à l'intégration, partage d'expériences professionnelles, recommandations de services, et bien plus. L'entraide est au cœur de notre mission.",
    },
    {
      id: "item-5",
      icon: "globe",
      question:
        "La plateforme est-elle accessible aux Malagasy restés au pays ?",
      answer:
        "Oui ! Notre mission est de créer un pont entre les Malagasy vivant en Allemagne et ceux restés à Madagascar. Les membres au pays peuvent également s'inscrire pour partager des opportunités, maintenir les liens culturels et faciliter les échanges entre la diaspora et le pays d'origine.",
    },
    {
      id: "item-6",
      icon: "shield",
      question: "Mes données personnelles sont-elles sécurisées ?",
      answer:
        "La protection de vos données est notre priorité. Nous respectons le RGPD européen et ne partageons jamais vos informations personnelles avec des tiers sans votre consentement. Vous gardez le contrôle total sur la visibilité de votre profil et vos informations.",
    },
  ];

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-4 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:gap-16">
          <div className="md:w-1/3">
            <div className="sticky top-20">
              <h2 className="mt-4 text-3xl font-bold">Questions Fréquentes</h2>
              <p className="text-muted-foreground mt-4">
                Vous ne trouvez pas ce que vous cherchez ? Contactez notre{" "}
                <Link
                  href="#"
                  className="text-primary font-medium hover:underline"
                >
                  équipe de support
                </Link>{" "}
                ou posez votre question dans la communauté.
              </p>
            </div>
          </div>
          <div className="md:w-2/3">
            <Accordion type="single" collapsible className="w-full space-y-2">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="bg-background shadow-xs rounded-lg border px-4 last:border-b"
                >
                  <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                    <div className="flex items-center gap-3">
                      <div className="flex size-6">
                        <DynamicIcon
                          name={item.icon}
                          className="m-auto size-4"
                        />
                      </div>
                      <span className="text-base">{item.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5">
                    <div className="px-9">
                      <p className="text-base">{item.answer}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
}
