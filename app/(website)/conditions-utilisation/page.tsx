import { WebsiteHeader } from "@/components/website-header";
import { WebsiteFooter } from "@/components/website-footer";

export default function ConditionsUtilisationPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <WebsiteHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold">Conditions générales d&apos;utilisation</h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="mb-4 text-2xl font-semibold">1. Objet</h2>
                <p className="text-muted-foreground">
                  Les présentes conditions générales d&apos;utilisation (ci-après les &quot;CGU&quot;) 
                  ont pour objet de définir les conditions et modalités d&apos;utilisation du site 
                  StudyHub ainsi que les droits et obligations des parties dans ce cadre.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Elles constituent un contrat entre StudyHub et l&apos;utilisateur. L&apos;accès 
                  et l&apos;utilisation du site impliquent l&apos;acceptation pleine et entière 
                  des présentes CGU.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">2. Acceptation des conditions</h2>
                <p className="text-muted-foreground">
                  L&apos;utilisation du site StudyHub implique l&apos;acceptation pleine et entière 
                  des présentes CGU. Si vous n&apos;acceptez pas ces conditions, vous ne devez pas 
                  utiliser le site.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">3. Accès au site</h2>
                <p className="text-muted-foreground">
                  L&apos;accès au site StudyHub est gratuit pour tout utilisateur disposant d&apos;un 
                  accès à Internet. Tous les frais nécessaires pour l&apos;accès aux services 
                  (matériel informatique, connexion Internet, etc.) sont à la charge de l&apos;utilisateur.
                </p>
                <p className="mt-4 text-muted-foreground">
                  StudyHub se réserve le droit de modifier, suspendre ou interrompre l&apos;accès 
                  au site à tout moment sans préavis.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">4. Inscription et compte utilisateur</h2>
                <p className="text-muted-foreground">
                  Pour accéder à certaines fonctionnalités du site, l&apos;utilisateur doit créer 
                  un compte en fournissant des informations exactes et complètes. L&apos;utilisateur 
                  s&apos;engage à :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Fournir des informations exactes et à jour</li>
                  <li>Maintenir la sécurité de son compte et de son mot de passe</li>
                  <li>Être responsable de toutes les activités qui se produisent sous son compte</li>
                  <li>Notifier immédiatement StudyHub de toute utilisation non autorisée de son compte</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">5. Utilisation du site</h2>
                <p className="text-muted-foreground">
                  L&apos;utilisateur s&apos;engage à utiliser le site StudyHub de manière licite et 
                  conformément aux présentes CGU. Il est strictement interdit :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>D&apos;utiliser le site à des fins illégales ou frauduleuses</li>
                  <li>De porter atteinte aux droits de tiers</li>
                  <li>De diffuser des contenus illicites, diffamatoires, injurieux ou contraires aux bonnes mœurs</li>
                  <li>De perturber le fonctionnement du site ou des serveurs</li>
                  <li>De tenter d&apos;accéder de manière non autorisée au site ou à ses systèmes</li>
                  <li>De reproduire, copier ou vendre tout ou partie du site sans autorisation</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">6. Contenu utilisateur</h2>
                <p className="text-muted-foreground">
                  L&apos;utilisateur conserve la propriété de ses contenus (notes, documents, etc.) 
                  qu&apos;il publie sur StudyHub. En publiant du contenu, l&apos;utilisateur accorde 
                  à StudyHub une licence non exclusive, gratuite et mondiale pour utiliser, reproduire, 
                  modifier et afficher ce contenu dans le cadre du service.
                </p>
                <p className="mt-4 text-muted-foreground">
                  L&apos;utilisateur garantit qu&apos;il dispose de tous les droits nécessaires sur 
                  les contenus qu&apos;il publie et que ces contenus ne violent aucun droit de tiers.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">7. Propriété intellectuelle</h2>
                <p className="text-muted-foreground">
                  Le site StudyHub et l&apos;ensemble de son contenu (textes, images, logos, icônes, 
                  logiciels) sont protégés par le droit de la propriété intellectuelle et appartiennent 
                  à StudyHub ou à ses partenaires.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Toute reproduction, représentation, modification ou adaptation sans autorisation 
                  préalable de StudyHub est interdite et constitue une contrefaçon passible de sanctions 
                  pénales.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">8. Disponibilité du service</h2>
                <p className="text-muted-foreground">
                  StudyHub s&apos;efforce d&apos;assurer une disponibilité du service 24h/24 et 7j/7. 
                  Cependant, StudyHub ne peut garantir une disponibilité absolue du service en raison 
                  de contraintes techniques, de maintenance ou de cas de force majeure.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">9. Responsabilité</h2>
                <p className="text-muted-foreground">
                  StudyHub ne pourra être tenu responsable des dommages directs ou indirects résultant 
                  de l&apos;utilisation ou de l&apos;impossibilité d&apos;utiliser le site, notamment 
                  en cas de perte de données.
                </p>
                <p className="mt-4 text-muted-foreground">
                  L&apos;utilisateur est seul responsable de l&apos;utilisation qu&apos;il fait du 
                  site et des contenus qu&apos;il y publie.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">10. Modification des CGU</h2>
                <p className="text-muted-foreground">
                  StudyHub se réserve le droit de modifier les présentes CGU à tout moment. Les 
                  modifications entrent en vigueur dès leur publication sur le site. Il appartient 
                  à l&apos;utilisateur de consulter régulièrement les CGU.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">11. Résiliation</h2>
                <p className="text-muted-foreground">
                  StudyHub se réserve le droit de suspendre ou résilier l&apos;accès d&apos;un 
                  utilisateur au site en cas de violation des présentes CGU, sans préavis ni 
                  remboursement.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">12. Droit applicable et juridiction</h2>
                <p className="text-muted-foreground">
                  Les présentes CGU sont régies par le droit français. En cas de litige et à défaut 
                  d&apos;accord amiable, le litige sera porté devant les tribunaux français 
                  conformément aux règles de compétence en vigueur.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">13. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant les présentes CGU, vous pouvez nous contacter à 
                  l&apos;adresse suivante : contact@studyhub.fr
                </p>
              </section>

              <section>
                <p className="text-sm text-muted-foreground">
                  Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { 
                    year: "numeric", 
                    month: "long", 
                    day: "numeric" 
                  })}
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <WebsiteFooter />
    </div>
  );
}
