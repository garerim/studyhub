import Link from "next/link";
import {
  BookOpen,
  FileText,
  LayoutDashboard,
  Check,
  ArrowRight,
  NotebookPen,
  GraduationCap,
  Sparkles,
  Brain,
  Target,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WebsiteHeader } from "@/components/website-header";
import { WebsiteFooter } from "@/components/website-footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <WebsiteHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 md:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-2 text-sm">
              <Sparkles className="size-4" />
              <span>La plateforme d&apos;apprentissage pour étudiants</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              Organisez vos notes,
              <br />
              <span className="text-primary">maîtrisez vos études</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl">
              StudyHub vous aide à gérer vos notes, organiser vos matières et
              suivre votre progression. Avec notre IA avancée, transformez vos
              notes en cours claires, obtenez des conseils personnalisés et
              générez des quizz adaptés. Tout ce dont vous avez besoin pour
              réussir vos études en un seul endroit.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Découvrir les fonctionnalités</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Tout ce dont vous avez besoin pour réussir
              </h2>
              <p className="text-lg text-muted-foreground">
                Des outils puissants pour organiser vos études et améliorer
                votre apprentissage
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="size-6 text-primary" />
                  </div>
                  <CardTitle>Gestion de notes</CardTitle>
                  <CardDescription>
                    Organisez et gérez toutes vos notes de cours en un seul
                    endroit. Créez, modifiez et recherchez facilement dans vos
                    documents.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <BookOpen className="size-6 text-primary" />
                  </div>
                  <CardTitle>Matières personnalisées</CardTitle>
                  <CardDescription>
                    Créez et organisez vos matières selon vos besoins. Ajoutez
                    des notes, des documents et suivez votre progression pour
                    chaque matière.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <Brain className="size-6 text-primary" />
                  </div>
                  <CardTitle>IA de rédaction de notes</CardTitle>
                  <CardDescription>
                    Notre IA transforme vos notes en cours claires et
                    pédagogiques. Obtenez des résumés structurés et faciles à
                    comprendre pour optimiser votre apprentissage.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <Target className="size-6 text-primary" />
                  </div>
                  <CardTitle>Analyse IA des performances</CardTitle>
                  <CardDescription>
                    L&apos;IA analyse vos points forts et vos points faibles,
                    puis vous conseille précisément sur les domaines à
                    améliorer pour progresser efficacement.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <Zap className="size-6 text-primary" />
                  </div>
                  <CardTitle>Génération de quizz</CardTitle>
                  <CardDescription>
                    Générez automatiquement des quizz personnalisés selon vos
                    cours et vos attentes. Testez vos connaissances et
                    identifiez rapidement vos lacunes.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <LayoutDashboard className="size-6 text-primary" />
                  </div>
                  <CardTitle>Tableau de bord</CardTitle>
                  <CardDescription>
                    Accédez rapidement à toutes vos ressources. Un aperçu
                    complet de votre progression et de vos dernières activités.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <NotebookPen className="size-6 text-primary" />
                  </div>
                  <CardTitle>Organisation intuitive</CardTitle>
                  <CardDescription>
                    Interface simple et intuitive pour une organisation efficace
                    de vos contenus d&apos;apprentissage.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="size-6 text-primary" />
                  </div>
                  <CardTitle>Suivi de progression</CardTitle>
                  <CardDescription>
                    Visualisez votre progression dans chaque matière et
                    identifiez les domaines à améliorer grâce à des statistiques
                    détaillées.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="size-6 text-primary" />
                  </div>
                  <CardTitle>Accès rapide</CardTitle>
                  <CardDescription>
                    Trouvez rapidement ce que vous cherchez grâce à une
                    navigation optimisée et des recherches efficaces.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="border-t py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-16 max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Tarifs simples et transparents
              </h2>
              <p className="text-lg text-muted-foreground">
                Choisissez le plan qui correspond à vos besoins
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Gratuit</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">0€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                  <CardDescription className="mt-4">
                    Parfait pour commencer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Jusqu&apos;à 5 matières</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Notes illimitées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Tableau de bord</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Support communautaire</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-muted-foreground opacity-50" />
                      <span className="text-sm text-muted-foreground line-through">
                        Fonctionnalités IA
                      </span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full" variant="outline" asChild>
                    <Link href="/register">Commencer</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-primary">
                <CardHeader>
                  <div className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    Populaire
                  </div>
                  <CardTitle>Étudiant</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">9€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                  <CardDescription className="mt-4">
                    Pour les étudiants sérieux
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Matières illimitées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Notes illimitées</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Tableau de bord avancé</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">IA de rédaction de notes</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Analyse IA des performances</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Génération de quizz (limité)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Support prioritaire</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Export de données</span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full" asChild>
                    <Link href="/register">Choisir ce plan</Link>
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Premium</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">19€</span>
                    <span className="text-muted-foreground">/mois</span>
                  </div>
                  <CardDescription className="mt-4">
                    Pour les professionnels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Tout du plan Étudiant</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">IA de rédaction de notes (illimité)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Analyse IA avancée des performances</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Génération de quizz illimitée</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Collaboration en équipe</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Support dédié</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="size-5 text-primary" />
                      <span className="text-sm">Personnalisation avancée</span>
                    </li>
                  </ul>
                  <Button className="mt-6 w-full" variant="outline" asChild>
                    <Link href="/register">Choisir ce plan</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="border-t bg-muted/50 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                À propos de StudyHub
              </h2>
              <p className="mb-6 text-lg text-muted-foreground">
                StudyHub a été créé pour aider les étudiants à mieux organiser
                leur apprentissage. Nous croyons que chaque étudiant mérite des
                outils puissants et simples pour réussir ses études.
              </p>
              <p className="text-lg text-muted-foreground">
                Notre mission est de rendre l&apos;apprentissage plus accessible,
                organisé et efficace pour tous les étudiants, peu importe leur
                niveau ou leur domaine d&apos;études.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
                Prêt à commencer ?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Rejoignez StudyHub aujourd&apos;hui et transformez votre façon
                d&apos;apprendre
              </p>
              <Button size="lg" asChild>
                <Link href="/register">
                  Créer un compte gratuit
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <WebsiteFooter />
    </div>
  );
}
