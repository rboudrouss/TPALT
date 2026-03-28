import type { Locale } from "./i18n/types";
import { TOPICS_EN } from "./i18n/topics-en";

export const TOPICS_FR: string[] = [
  // Technologie & IA
  "L'intelligence artificielle est une menace pour la créativité humaine.",
  "Les réseaux sociaux nuisent à la démocratie.",
  "Les voitures autonomes devraient être légalisées.",
  "Internet devrait être considéré comme un droit fondamental.",
  "L'IA remplacera les médecins d'ici 2050.",
  "Les algorithmes de recommandation appauvrissent notre culture.",
  "Le métaverse est l'avenir des interactions sociales.",
  "L'IA générative doit être régulée pour protéger les artistes.",
  "La surveillance de masse par l'État est justifiable au nom de la sécurité.",
  "Le droit à l'oubli numérique devrait être universel.",

  // Société & Politique
  "La propriété privée devrait être abolie.",
  "Le vote devrait être obligatoire.",
  "La peine de mort est justifiable.",
  "Le revenu universel de base est une solution viable.",
  "La démocratie directe est préférable à la démocratie représentative.",
  "Des quotas de parité devraient être instaurés dans toutes les entreprises.",
  "L'État devrait financer les partis politiques.",
  "Le capitalisme doit être remplacé plutôt que réformé.",
  "Le fédéralisme mondial est une utopie nécessaire.",
  "Les lobbys devraient être interdits dans les démocraties.",

  // Éducation
  "L'éducation devrait être entièrement gratuite et publique.",
  "L'enseignement à domicile nuit à la socialisation des enfants.",
  "Les examens nationaux sont un indicateur fiable de l'intelligence.",
  "Les universités privées creusent les inégalités sociales.",
  "Le numérique détériore l'apprentissage scolaire.",
  "Les notes devraient être supprimées à l'école primaire.",
  "L'apprentissage des langues étrangères devrait commencer dès la maternelle.",
  "Les grandes écoles françaises reproduisent les élites.",
  "La philosophie devrait être enseignée dès l'école primaire.",
  "Les devoirs à la maison sont contre-productifs.",

  // Environnement & Énergie
  "La colonisation de Mars est une priorité face aux crises terrestres.",
  "Le nucléaire est indispensable pour atteindre la neutralité carbone.",
  "L'avion devrait être interdit pour les vols intérieurs.",
  "La viande de synthèse peut sauver la planète.",
  "La décroissance économique est la seule réponse viable au changement climatique.",
  "Les énergies renouvelables peuvent remplacer intégralement les énergies fossiles.",
  "L'éco-anxiété est une réponse rationnelle face à la crise climatique.",
  "Les SUV devraient être massivement taxés en milieu urbain.",
  "Le végétarisme devrait être encouragé par des politiques fiscales.",
  "Les océans devraient bénéficier d'un statut juridique de personne morale.",

  // Éthique & Philosophie
  "L'art contemporain a perdu son sens.",
  "La liberté d'expression a des limites légitimes.",
  "Le mensonge peut être moralement justifié.",
  "Les milliardaires devraient être obligés de redistribuer leur fortune.",
  "L'euthanasie active devrait être légalisée partout en Europe.",
  "Le transhumanisme est une évolution naturelle de l'humanité.",
  "L'altruisme pur existe.",
  "La fin justifie les moyens en politique.",
  "Le travail bénévole devrait être rémunéré.",
  "L'immortalité serait une malédiction pour l'humanité.",

  // Santé
  "La vaccination devrait être obligatoire.",
  "Les réseaux sociaux aggravent la santé mentale des adolescents.",
  "Le système de santé privé est incompatible avec l'égalité des soins.",
  "Toutes les drogues douces devraient être légalisées.",
  "Le sport de haut niveau est exploiteur des athlètes.",
  "Le don d'organes devrait être présumé pour tous les citoyens.",
  "Les diètes restrictives sont une forme d'auto-maltraitance.",
  "L'accès aux soins psychologiques devrait être intégralement remboursé.",
  "Les fast-foods devraient afficher clairement les risques sanitaires.",
  "L'État devrait interdire la vente de tabac aux personnes nées après 2010.",

  // Économie & Travail
  "La semaine de 4 jours devrait être généralisée.",
  "Le télétravail nuit à la cohésion des équipes.",
  "Les salaires des dirigeants d'entreprise devraient être plafonnés.",
  "La mondialisation a aggravé les inégalités mondiales.",
  "Le tourisme de masse devrait être régulé par les États.",
  "L'automatisation est une menace pour les travailleurs.",
  "Les start-ups sont surévaluées par rapport à l'économie réelle.",
  "Le commerce équitable est insuffisant pour réduire les injustices économiques.",
  "Les paradis fiscaux devraient être supprimés par des sanctions internationales.",
  "La propriété intellectuelle freine l'innovation.",

  // Justice & Droit
  "Les prisons aggravent la criminalité plutôt qu'elles ne réhabilitent.",
  "Le tirage au sort devrait remplacer les élections pour certains postes.",
  "La présomption d'innocence est menacée par les réseaux sociaux.",
  "Les crimes de haine devraient être punis plus sévèrement.",
  "La majorité pénale devrait être abaissée à 16 ans.",
  "Le droit à l'avortement devrait être inscrit dans toutes les constitutions.",
  "Les sanctions économiques internationales sont efficaces.",
  "Les associations de consommateurs n'ont pas assez de pouvoir juridique.",
  "Un tribunal international pour les crimes environnementaux devrait être créé.",
  "La justice restauratrice est plus efficace que la justice punitive.",

  // Culture & Médias
  "L'intelligence artificielle peut produire de l'art véritable.",
  "Les jeux vidéo violents influencent le comportement des jeunes.",
  "La presse écrite a encore un avenir à l'ère du numérique.",
  "Le cinéma hollywoodien uniformise la culture mondiale.",
  "Les musées devraient restituer les œuvres issues de la colonisation.",
  "La culture populaire mérite autant de respect que la culture classique.",
  "Les influenceurs ont une responsabilité sociale.",
  "Les deepfakes devraient être réglementés dans les médias.",
  "Le piratage numérique nuit aux artistes.",
  "Le sport est devenu trop commercialisé.",

  // International & Géopolitique
  "L'ONU est encore capable de maintenir la paix mondiale.",
  "L'aide au développement perpétue la dépendance des pays pauvres.",
  "Les frontières nationales sont encore pertinentes au XXIe siècle.",
  "L'Europe devrait se doter d'une armée commune.",
  "La Chine représente un modèle de développement alternatif viable.",
  "Les migrants économiques méritent la même protection que les réfugiés politiques.",
  "La diplomatie peut remplacer la force militaire.",
  "Les sanctions contre la Russie sont contre-productives.",
  "Le droit de veto au Conseil de sécurité de l'ONU devrait être supprimé.",
  "Le soft power est une forme d'ingérence culturelle.",
];

export function getRandomTopic(locale: Locale = "fr"): string {
  const topics = locale === "en" ? TOPICS_EN : TOPICS_FR;
  return topics[Math.floor(Math.random() * topics.length)];
}
