---
title: Dangers économiques et matériels
description: Les dangers économiques et matériels de l'IA incluent des impacts sur les infrastructures et les entreprises, de nouvelles vulnérabilités, et des défis d'automatisation, nécessitant une gestion prudente via la régulation et l'innovation technologique.
---

Les dangers économiques et matériels liés à l’intelligence artificielle concernent principalement les impacts directs sur les infrastructures, les entreprises, et la gestion des ressources. L’IA promet des avancées significatives dans l’optimisation et l’automatisation de nombreux processus mais elle introduit également de nouvelles vulnérabilités et risques de dysfonctionnements. Parmi ces menaces, on compte la facilitation d’attaques à l’aide de l’IA, les défaillances techniques et l’impact économique des technologies de rupture.

La gestion de ces menaces nécessite une vigilance accrue, des régulations rigoureuses et surtout des innovations technologiques pour garantir la résilience et la sécurité des systèmes d’IA et des systèmes confrontés à l’IA.

## Chômage de masse

Durant la révolution industrielle, de nombreux ouvriers ont perdu leur emploi au profit des machines. Cependant, de nouveaux emplois, souvent meilleurs, ont été créés et l'économie a connu une forte croissance. Cette fois-ci, la donne pourrait être différente.

Avec l’invention de la machine à vapeur, la valeur comparative du travail manuel de l’homme a chuté ; de même, à mesure que les capacités de l’IA s’améliorent dans les domaines cognitifs, la perte de valeur de son travail intellectuel peut le rendre inemployable par rapport aux alternatives informatiques. Les modèles de génération d'images (entraînés en majorité sur du matériel protégé par des droits d'auteur) ont déjà [un impact sur les métiers créatifs](https://cointelegraph.com/news/artists-face-a-choice-with-ai-adapt-or-become-obsolete). GPT-4 a réussi [l'examen du barreau](https://law.stanford.edu/2023/04/19/gpt-4-passes-the-bar-exam-what-that-means-for-artificial-intelligence-tools-in-the-legal-industry/), peut rédiger des articles convaincants et écrire du code.

Le profit de la compétitivité économique des IA bénéficiera à leurs propriétaires, mais que deviendront ceux qui auront ainsi perdu leur emploi ? Il est difficile de prédire quels emplois seront remplacés en premier, ce qui mène à une précarité sociale et peut invalider des années d’études, d’efforts et d’investissements. Notre modèle économique et notre système de répartition des richesses ne sont pas préparés à cette transition.

## Cyberattaques

Les logiciels espions comme [Pegasus](https://fr.wikipedia.org/wiki/Pegasus_(logiciel_espion)) coûtent des dizaines de millions de dollars à développer. Trouver des vulnérabilités dites « zero-day » dans les logiciels (des vulnérabilités qui n'ont pas encore été découvertes) demande beaucoup de travail, de compétences et de temps. Lorsque l’IA surpassera les meilleurs programmeurs humains, elle pourra être utilisée afin de créer de nouveaux types de cyberattaques et découvrir de nouvelles vulnérabilités plus vite et à moindre coût.

Les systèmes d'IA peuvent déjà analyser et écrire du code, trouver des [vulnérabilités](https://betterprogramming.pub/i-used-gpt-3-to-find-213-security-vulnerabilities-in-a-single-codebase-cc3870ba9411) et les [exploiter](https://blog.checkpoint.com/2023/03/15/check-point-research-conducts-initial-security-analysis-of-chatgpt4-highlighting-potential-scenarios-for-accelerated-cybercrime/).  Ils peuvent être utilisés pour [amplifier et automatiser des cyberattaques](https://www.crowdstrike.com/cybersecurity-101/cyberattacks/ai-powered-cyberattacks/), élargissant leur portée et leur impact et les rendant capables de s'adapter aux mesures de sécurité.

L’IA peut également être utilisée pour renforcer la cyberdéfense des systèmes informatiques mais son adoption dans ce domaine risque d'être plus lente que son utilisation offensive. La cybersécurité est un domaine asymétrique où il est plus facile de découvrir des vulnérabilités que de les corriger. Par exemple, les équipes de sécurité d'une entreprise mettent [en moyenne 271 jours pour corriger une faille identifiée](https://www.mend.io/blog/securing-the-software-supply-chain-mend-open-source-risk-report/#battling-the-remediation-gap).

Les cyberattaques peuvent avoir des conséquences sérieuses sur des infrastructures critiques comme les [oléoducs](https://fr.wikipedia.org/wiki/Cyberattaque_de_Colonial_Pipeline), les hôpitaux, les [réseaux électriques](https://obr.uk/box/cyber-attacks-during-the-russian-invasion-of-ukraine/), les bureaux gouvernementaux ou encore les [banques](https://fr.wikipedia.org/wiki/Cyber-braquage_de_la_banque_centrale_du_Bangladesh).

Ces types de menaces peuvent être évités par la [régulation du déploiement d’IA à fortes capacités de programmation](https://pauseia.fr/propositions).

## Perte de fonction par défaut

À cause de problèmes de [mauvaise généralisation des objectifs](https://arxiv.org/abs/2105.14111) ou de [détournement des spécifications](https://deepmind.google/discover/blog/specification-gaming-the-flip-side-of-ai-ingenuity/), il est difficile de garantir que des systèmes d’IA auront un comportement correct après leur déploiement. D’autres problèmes peuvent émerger durant l’entraînement des modèles d’IA. Par exemple, une erreur humaine lors de l’entraînement de GPT-2 a produit un modèle qui produisait du texte [à l’exact opposé du résultat désiré](https://arxiv.org/abs/1909.08593). Lorsque ces systèmes jouent un rôle crucial dans un processus économique, leur dysfonctionnement peut causer des dommages considérables.

Certains de ces dysfonctionnements sont issus d’un manque de données et de capacités et seront probablement réglés lorsque la technologie sera plus mature.

Si vous utilisez des systèmes d’IA à vos propres fins, tenez-vous au courant des limitations de vos outils, de leurs défauts connus et vérifiez la qualité des résultats produits.

Ce danger peut être mitigé en [contrôlant la qualité des systèmes d’IA](https://pauseia.fr/propositions) et en poussant plus loin les techniques actuelles d’alignement. 

## Perte de fonction par intervention extérieure

Un système d’IA est plus à risque de dysfonctionnement lorsqu’il se trouve en-dehors de ses conditions normales d’utilisation - on parle de sortie de distribution lorsque sa situation est différente de celles sur lesquelles il a été entraîné. On tente autant que possible d’améliorer la robustesse des IA hors distribution de nos jours, mais elles restent encore vulnérables aux « [attaques adverses](https://www.forbes.com/councils/forbestechcouncil/2023/07/27/adversarial-attacks-on-ai-systems/) ». Ces attaques consistent à délibérément tromper ou induire en erreur un modèle de façon à obtenir des comportements incorrects.

Concernant les IA généralistes comme les GPT, il est impossible d’explorer tous les cas d’utilisation possibles afin de les corriger, et il est relativement [facile de contourner les précautions de sécurité](https://www.reddit.com/r/ChatGPTJailbreak/wiki/index/) qui empêchent l’utilisateur moyen d’utiliser ces modèles à des fins néfastes.

De plus, l’utilisation de quantités massives de données impossibles à contrôler manuellement ouvre la voie à [l’empoisonnement de données](https://arxiv.org/pdf/1804.00308) qui introduisent des vulnérabilités dans les systèmes qui s’entraînent dessus.

Les attaques adverses peuvent aussi être utilisées pour renforcer la sécurité d’un système et l’empoisonnement de données permet à des acteurs indépendants de lutter contre le vol de données.

Ces dangers font l’objet de beaucoup de recherches motivées par des intérêts économiques et de souveraineté donc la dynamique entre attaque et défense fluctue rapidement. Ils peuvent être influencés par des actions à toutes les étapes : régulation, standards, alignement technique, sécurité au déploiement, etc.

## Takeover entrepreneurial

Les nombreuses applications de l’IA présentent des opportunités d’innovations de rupture qui permettraient à des entreprises de gagner rapidement en valeur et de s’imposer à travers la société. Alors que cette possibilité est généralement acceptée comme une conséquence normale de notre système économique, les applications de l’IA à la [surveillance](https://www.forbes.com/councils/forbestechcouncil/2024/02/02/artificial-intelligence-the-new-eyes-of-surveillance/), à la [persuasion](https://arxiv.org/pdf/2303.08721), à la médecine et à l’armement devraient nous rendre circonspect pour une fois : voulons-nous d’une entreprise globale qui domine notre capacité à nous soigner ou dont l’aval est nécessaire pour avoir des opinions individuelles protégées des outils de manipulation en ligne ?

Un takeover entrepreneurial diminuerait la responsabilité des fournisseurs d’IA et paverait la voie à des abus d’une ampleur sans précédent. Ce danger peut être mitigé par [des régulations, des actions en justice et un engagement citoyen sur le sujet](https://pauseia.fr/propositions).
