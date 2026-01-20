import Link from "next/link";
import { BookOpen, FileText, LayoutDashboard, Users } from "lucide-react";

export function WebsiteFooter() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-lg font-bold">StudyHub</h3>
            <p className="text-sm text-muted-foreground">
              La plateforme qui aide les étudiants à apprendre et à s'organiser
              avec leurs notes et leurs matières.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Produit</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#features"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Fonctionnalités
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Tarifs
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  S'inscrire
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Ressources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="#about"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Connexion
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-sm font-semibold">Fonctionnalités</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <FileText className="size-4" />
                Gestion de notes
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <BookOpen className="size-4" />
                Matières personnalisées
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <LayoutDashboard className="size-4" />
                Tableau de bord
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Users className="size-4" />
                Organisation
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} StudyHub. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
