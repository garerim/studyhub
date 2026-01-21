import { WebsiteHeader } from "@/components/website-header";
import { WebsiteFooter } from "@/components/website-footer";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <WebsiteHeader />
      <main className="flex-1">
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-4xl">
            <h1 className="mb-8 text-4xl font-bold">Politique de confidentialité</h1>
            
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
              <section>
                <h2 className="mb-4 text-2xl font-semibold">1. Introduction</h2>
                <p className="text-muted-foreground">
                  StudyHub (ci-après &quot;nous&quot;, &quot;notre&quot; ou &quot;le service&quot;) 
                  s&apos;engage à protéger la confidentialité et la sécurité des données personnelles 
                  de ses utilisateurs. La présente politique de confidentialité explique comment nous 
                  collectons, utilisons, stockons et protégeons vos données personnelles conformément 
                  au Règlement Général sur la Protection des Données (RGPD).
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">2. Données collectées</h2>
                <p className="text-muted-foreground">
                  Nous collectons les données personnelles suivantes :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>
                    <strong>Données d&apos;identification :</strong> nom, prénom, adresse email
                  </li>
                  <li>
                    <strong>Données de connexion :</strong> adresse IP, logs de connexion, identifiants
                  </li>
                  <li>
                    <strong>Données de navigation :</strong> cookies, données de navigation, préférences
                  </li>
                  <li>
                    <strong>Données de contenu :</strong> notes, documents, matières créées par l&apos;utilisateur
                  </li>
                  <li>
                    <strong>Données de paiement :</strong> informations de facturation (pour les abonnements payants)
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">3. Finalités du traitement</h2>
                <p className="text-muted-foreground">
                  Vos données personnelles sont collectées et traitées pour les finalités suivantes :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Gestion de votre compte utilisateur</li>
                  <li>Fourniture des services StudyHub</li>
                  <li>Amélioration de nos services et de l&apos;expérience utilisateur</li>
                  <li>Communication avec vous concernant le service</li>
                  <li>Gestion des abonnements et facturation</li>
                  <li>Respect de nos obligations légales et réglementaires</li>
                  <li>Prévention de la fraude et sécurisation du service</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">4. Base légale du traitement</h2>
                <p className="text-muted-foreground">
                  Le traitement de vos données personnelles est fondé sur :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Votre consentement (pour les cookies et communications marketing)</li>
                  <li>L&apos;exécution d&apos;un contrat (fourniture du service)</li>
                  <li>Le respect d&apos;obligations légales</li>
                  <li>Notre intérêt légitime (amélioration du service, sécurité)</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">5. Conservation des données</h2>
                <p className="text-muted-foreground">
                  Vos données personnelles sont conservées pendant la durée nécessaire aux finalités 
                  pour lesquelles elles ont été collectées :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Données de compte : pendant la durée de votre compte et 3 ans après sa fermeture</li>
                  <li>Données de contenu : jusqu&apos;à suppression par l&apos;utilisateur ou fermeture du compte</li>
                  <li>Données de facturation : 10 ans (obligation légale)</li>
                  <li>Cookies : 13 mois maximum</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">6. Partage des données</h2>
                <p className="text-muted-foreground">
                  Vos données personnelles ne sont pas vendues à des tiers. Elles peuvent être 
                  partagées avec :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>
                    <strong>Prestataires techniques :</strong> hébergeurs, services de paiement, 
                    outils d&apos;analyse (sous contrat de confidentialité)
                  </li>
                  <li>
                    <strong>Autorités compétentes :</strong> en cas d&apos;obligation légale ou 
                    de réquisition judiciaire
                  </li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  Tous nos prestataires sont soumis à des obligations strictes de confidentialité 
                  et de sécurité.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">7. Sécurité des données</h2>
                <p className="text-muted-foreground">
                  Nous mettons en œuvre des mesures techniques et organisationnelles appropriées 
                  pour protéger vos données personnelles contre la perte, l&apos;utilisation 
                  abusive, l&apos;accès non autorisé, la divulgation, l&apos;altération ou la 
                  destruction :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>Chiffrement des données sensibles</li>
                  <li>Authentification sécurisée</li>
                  <li>Surveillance et détection des intrusions</li>
                  <li>Sauvegardes régulières</li>
                  <li>Formation du personnel à la sécurité des données</li>
                </ul>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">8. Vos droits</h2>
                <p className="text-muted-foreground">
                  Conformément au RGPD, vous disposez des droits suivants concernant vos données 
                  personnelles :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>
                    <strong>Droit d&apos;accès :</strong> obtenir une copie de vos données personnelles
                  </li>
                  <li>
                    <strong>Droit de rectification :</strong> corriger vos données inexactes ou incomplètes
                  </li>
                  <li>
                    <strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données
                  </li>
                  <li>
                    <strong>Droit à la limitation :</strong> limiter le traitement de vos données
                  </li>
                  <li>
                    <strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré
                  </li>
                  <li>
                    <strong>Droit d&apos;opposition :</strong> vous opposer au traitement de vos données
                  </li>
                  <li>
                    <strong>Droit de retrait du consentement :</strong> retirer votre consentement à tout moment
                  </li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  Pour exercer ces droits, contactez-nous à : contact@studyhub.fr ou via votre 
                  compte utilisateur.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">9. Cookies</h2>
                <p className="text-muted-foreground">
                  Le site StudyHub utilise des cookies pour améliorer votre expérience de navigation. 
                  Les cookies sont de petits fichiers texte stockés sur votre appareil.
                </p>
                <p className="mt-4 text-muted-foreground">
                  Types de cookies utilisés :
                </p>
                <ul className="list-disc pl-6 text-muted-foreground">
                  <li>
                    <strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site
                  </li>
                  <li>
                    <strong>Cookies analytiques :</strong> pour comprendre l&apos;utilisation du site
                  </li>
                  <li>
                    <strong>Cookies de préférences :</strong> pour mémoriser vos choix
                  </li>
                </ul>
                <p className="mt-4 text-muted-foreground">
                  Vous pouvez gérer vos préférences de cookies via les paramètres de votre navigateur.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">10. Transferts internationaux</h2>
                <p className="text-muted-foreground">
                  Vos données personnelles sont stockées et traitées au sein de l&apos;Union Européenne. 
                  En cas de transfert hors UE, nous nous assurons que des garanties appropriées sont 
                  en place conformément au RGPD.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">11. Modifications</h2>
                <p className="text-muted-foreground">
                  Nous pouvons modifier la présente politique de confidentialité à tout moment. 
                  Les modifications entrent en vigueur dès leur publication sur le site. Nous vous 
                  encourageons à consulter régulièrement cette page.
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">12. Réclamation</h2>
                <p className="text-muted-foreground">
                  Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire 
                  une réclamation auprès de la Commission Nationale de l&apos;Informatique et 
                  des Libertés (CNIL) :
                </p>
                <p className="mt-4 text-muted-foreground">
                  CNIL - 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07
                  <br />
                  Téléphone : 01 53 73 22 22
                  <br />
                  Site web : www.cnil.fr
                </p>
              </section>

              <section>
                <h2 className="mb-4 text-2xl font-semibold">13. Contact</h2>
                <p className="text-muted-foreground">
                  Pour toute question concernant la présente politique de confidentialité ou pour 
                  exercer vos droits, vous pouvez nous contacter :
                </p>
                <ul className="list-none pl-0 text-muted-foreground">
                  <li>Email : contact@studyhub.fr</li>
                  <li>Par courrier : [Adresse à compléter]</li>
                </ul>
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
