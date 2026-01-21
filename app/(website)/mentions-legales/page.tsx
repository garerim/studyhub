import { WebsiteHeader } from "@/components/website-header";
import { WebsiteFooter } from "@/components/website-footer";

export default function MentionsLegalesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <WebsiteHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold">Mentions légales</h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="mb-4 text-2xl font-semibold">1. Informations sur l&apos;éditeur</h2>
                <p className="text-muted-foreground">
                  Le site StudyHub est édité par :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Dénomination sociale : StudyHub</li>
                  <li>Forme juridique : Société par actions simplifiée (SAS)</li>
                  <li>Siège social : [Adresse à compléter]</li>
                  <li>SIRET : [Numéro SIRET à compléter]</li>
                  <li>RCS : [Ville du RCS à compléter]</li>
                  <li>Email : contact@studyhub.fr</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">2. Directeur de publication</h2>
                <p className="text-muted-foreground">
                  Le directeur de publication est [Nom du directeur de publication].
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">3. Hébergement</h2>
                <p className="text-muted-foreground">
                  Le site StudyHub est hébergé par :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Nom de l&apos;hébergeur : [Nom à compléter]</li>
                  <li>Adresse : [Adresse à compléter]</li>
                  <li>Téléphone : [Numéro à compléter]</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">4. Propriété intellectuelle</h2>
                <p className="text-muted-foreground">
                  L&apos;ensemble du contenu du site StudyHub (textes, images, vidéos, logos, icônes) 
                  est la propriété exclusive de StudyHub, sauf mention contraire. Toute reproduction, 
                  représentation, modification, publication, adaptation de tout ou partie des éléments 
                  du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation 
                  écrite préalable de StudyHub.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">5. Protection des données personnelles</h2>
                <p className="text-muted-foreground">
                  Les données personnelles collectées sur le site StudyHub sont traitées conformément 
                  à notre politique de confidentialité. Pour plus d&apos;informations, consultez notre 
                  page{" "}
                  <a href="/politique-confidentialite" className="text-primary hover:underline">
                    Politique de confidentialité
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">6. Cookies</h2>
                <p className="text-muted-foreground">
                  Le site StudyHub utilise des cookies pour améliorer l&apos;expérience utilisateur. 
                  En continuant à naviguer sur le site, vous acceptez l&apos;utilisation de cookies 
                  conformément à notre politique de confidentialité.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">7. Responsabilité</h2>
                <p className="text-muted-foreground">
                  StudyHub s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations 
                  diffusées sur le site. Cependant, StudyHub ne peut garantir l&apos;exactitude, 
                  la précision ou l&apos;exhaustivité des informations mises à disposition sur le site.
                </p>
                <p className="mt-4 text-muted-foreground">
                  StudyHub ne pourra être tenu responsable des dommages directs ou indirects causés 
                  au matériel de l&apos;utilisateur lors de l&apos;accès au site, et résultant soit 
                  de l&apos;utilisation d&apos;un matériel ne répondant pas aux spécifications, soit 
                  de l&apos;apparition d&apos;un bug ou d&apos;une incompatibilité.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">8. Droit applicable</h2>
                <p className="text-muted-foreground">
                  Les présentes mentions légales sont régies par le droit français. En cas de litige 
                  et à défaut d&apos;accord amiable, le litige sera porté devant les tribunaux français 
                  conformément aux règles de compétence en vigueur.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">9. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant les présentes mentions légales, vous pouvez nous 
                  contacter à l&apos;adresse suivante : contact@studyhub.fr
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
