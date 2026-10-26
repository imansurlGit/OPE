from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from .validators import (
    validate_file_size,
    validate_image_extension,
    validate_doc_or_image_extension,
    validate_mascotte_dessin,
    validate_telephone_tuteur,
)

class Candidature(models.Model):
    CATEGORIE_CHOICES = [
        ("junior", "Junior"),
        ("senior", "Senior"),
    ]

    MAISON_CHOICES = [
        ("steam", "STEAM"),
        ("local_project", "Local Project"),
        ("mouvement_citoyen", "Modèle Citoyen Communautaire ou MC2"),
    ]

    SEXE_CHOICES = [
        ("M", "Masculin"),
        ("F", "Féminin"),
    ]

    STATUT_CHOICES = [
        ("soumis", "Dossier soumis"),
        ("admis", "Admis au Camp National"),
    ]

    CLASSE_CHOICES = [
        ("6e", "6e"),
        ("5e", "5e"),
        ("4e", "4e"),
        ("3e", "3e"),
    ]

    DOMAINE_STEAM_CHOICES = [
        # STEAM
        ("robotique", "Robotique"),
        ("ia", "Intelligence Artificielle"),
        ("aerospatial", "Aéronautique (simulateur de vol, montage de drones, observation de l'espace)"),
        ("aeronautique", "Aéronautique"),
        ("solaire", "Énergies renouvelables / Solaire"),
        ("energies_renouvelables", "Énergies renouvelables"),
        ("biotech", "Biotechnologie"),
        ("biotechnologie", "Biotechnologie"),
        ("art", "Art"),
        ("maths_logique", "Mathématiques et Logique"),
        # LP – Local Project
        ("agriculture", "Agriculture"),
        ("elevage", "Élevage"),
        ("artisanat", "Artisanat"),
        ("entrepreneuriat", "Entrepreneuriat"),
        ("marketing_digital", "Marketing digital"),
        # MC2 – Modèle de Citoyen Communautaire
        ("debats_communautaires", "Débats communautaires"),
        ("formation_citoyennete", "Formation sur la citoyenneté, développement personnel et leadership"),
        ("fabrication_poubelles", "Fabrication de poubelles"),
        ("7km_paix", "7 km de la Paix"),
        ("rehabilitation_tables_bancs", "Réhabilitation de tables-bancs"),
        ("don", "Don"),
        ("plantation_arbres", "Plantation d'arbres"),
        ("sensibilisation_paix", "Sensibilisation à la paix"),
        ("sensibilisation_education", "Sensibilisation à l'éducation"),
        ("volontariat", "Volontariat"),
        # Autre
        ("autre", "Autre"),
    ]

    STADE_CHOICES = [
        ("prototype", "Prototype"),
        ("commercialise", "Produit commercialisé"),
        ("en_test", "En cours de test"),
    ]

    REGION_CHOICES = [
        ("Agadez", "Agadez"),
        ("Diffa", "Diffa"),
        ("Dosso", "Dosso"),
        ("Maradi", "Maradi"),
        ("Niamey", "Niamey"),
        ("Tahoua", "Tahoua"),
        ("Tillabéri", "Tillabéri"),
        ("Zinder", "Zinder"),
        ("Diaspora / Autre", "Diaspora / Autre"),
    ]

    # --- Catégorie & Référence ---
    categorie = models.CharField(
        max_length=10,
        choices=CATEGORIE_CHOICES,
        default="senior",
        verbose_name="Catégorie",
    )
    maison = models.CharField(
        max_length=30,
        choices=MAISON_CHOICES,
        blank=True,
        default="",
        verbose_name="Maison",
    )
    reference = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        verbose_name="N° Dossier",
    )

    # --- Champs Communs ---
    nom = models.CharField(max_length=100, verbose_name="Nom de famille")
    prenom = models.CharField(max_length=100, verbose_name="Prénom(s)")
    telephone = models.CharField(max_length=30, blank=True, verbose_name="Numéro de téléphone")
    region_ville = models.CharField(
        max_length=50,
        choices=REGION_CHOICES,
        default="Agadez",
        verbose_name="Région de résidence",
    )

    # --- Champs Junior (Concours Mascotte) ---
    classe = models.CharField(max_length=10, choices=CLASSE_CHOICES, blank=True, verbose_name="Classe")
    etablissement = models.CharField(max_length=200, blank=True, verbose_name="Nom du collège / établissement")
    telephone_tuteur = models.CharField(max_length=30, blank=True, verbose_name="Téléphone parent / tuteur")
    nom_tuteur = models.CharField(max_length=150, blank=True, verbose_name="Nom du parent / tuteur")
    mascotte_nom = models.CharField(max_length=150, blank=True, verbose_name="Nom proposé de la mascotte")
    mascotte_pourquoi = models.TextField(blank=True, verbose_name="Pourquoi ce nom")
    mascotte_dessin = models.FileField(
        upload_to="candidatures/mascottes/",
        blank=True,
        null=True,
        validators=[validate_doc_or_image_extension],
        verbose_name="Dessin de la mascotte (photo/scan/PDF)",
    )
    mascotte_signification = models.TextField(blank=True, verbose_name="Signification de la mascotte")
    autorisation_parent = models.BooleanField(default=False, verbose_name="Autorisation parentale confirmée")
    accord_utilisation_dessin = models.BooleanField(default=False, verbose_name="Accord utilisation dessin par l'OPE")

    # --- Champs Senior (Innovation STEAM) ---
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES, blank=True, verbose_name="Sexe")
    email = models.EmailField(blank=True, verbose_name="Adresse e-mail")
    piece_identite = models.FileField(
        upload_to="candidatures/pieces/",
        blank=True,
        null=True,
        validators=[validate_doc_or_image_extension],
        verbose_name="Copie de la pièce d'identité",
    )
    photo_identite = models.ImageField(
        upload_to="candidatures/photos/",
        blank=True,
        null=True,
        validators=[validate_image_extension],
        verbose_name="Photo d'identité récente",
    )
    domaine_steam = models.CharField(
        max_length=150,
        choices=DOMAINE_STEAM_CHOICES,
        blank=True,
        verbose_name="Domaine / Classe",
    )
    domaine_steam_autre = models.CharField(
        max_length=150,
        blank=True,
        verbose_name="Précision domaine / classe autre",
    )
    innovation_nom = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Nom du produit / service / innovation",
    )
    innovation_description = models.TextField(
        blank=True,
        verbose_name="Description succincte de l'innovation",
    )
    stade_developpement = models.CharField(
        max_length=50,
        choices=STADE_CHOICES,
        blank=True,
        verbose_name="Stade de développement",
    )
    preuves_realisation = models.FileField(
        upload_to="candidatures/preuves/",
        blank=True,
        null=True,
        validators=[validate_doc_or_image_extension],
        verbose_name="Preuves de réalisation",
    )
    lien_portfolio = models.URLField(
        max_length=500,
        blank=True,
        verbose_name="Lien portfolio / vidéo de démonstration",
    )
    participe_defile = models.BooleanField(
        default=False,
        verbose_name="Participation au défilé scientifique",
    )
    oeuvre_defile = models.CharField(
        max_length=200,
        blank=True,
        verbose_name="Œuvre à présenter au défilé",
    )
    facilitateur_juniors = models.BooleanField(
        default=False,
        verbose_name="Volontariat facilitateur pour les Juniors",
    )
    souhaite_stand = models.BooleanField(
        default=False,
        verbose_name="Souhaite un stand d'exposition",
    )
    concours_prix_innovation = models.BooleanField(
        default=False,
        verbose_name="Candidature au Prix de la Meilleure Innovation STEAM",
    )
    disponible_camps = models.BooleanField(
        default=False,
        verbose_name="Disponible pendant les périodes des précamps et du Camp",
    )
    accepte_conditions = models.BooleanField(
        default=False,
        verbose_name="Accepte les conditions de participation du CNCEIZ",
    )

    # --- Suivi interne & Administration ---
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default="soumis",
        verbose_name="Statut du dossier",
    )
    note_interne = models.TextField(blank=True, verbose_name="Notes / Remarques admin")
    score_evaluation = models.IntegerField(
        default=0,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Score /100",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de soumission")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Candidature"
        verbose_name_plural = "Candidatures"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.reference:
            prefix = "CNCEIZ-J-2026" if self.categorie == "junior" else "CNCEIZ-S-2026"
            import secrets
            for _ in range(50):
                num = f"{secrets.randbelow(90000) + 10000:05d}"
                ref = f"{prefix}-{num}"
                if not Candidature.objects.filter(reference=ref).exists():
                    self.reference = ref
                    break
            else:
                import time
                self.reference = f"{prefix}-{int(time.time()) % 100000:05d}"
        if not self.statut:
            self.statut = "soumis"
        super().save(*args, **kwargs)

    def __str__(self):
        cat_label = "Junior" if self.categorie == "junior" else "Senior"
        return f"{self.reference} - {self.prenom} {self.nom} ({cat_label})"

class CandidatMascotte(models.Model):
    CLASSE_CHOICES = [
        ("6e", "6e"),
        ("5e", "5e"),
        ("4e", "4e"),
        ("3e", "3e"),
    ]

    STATUT_CHOICES = [
        ("en_attente", "En attente"),
        ("valide", "Validé"),
        ("rejete", "Rejeté"),
    ]

    reference = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        verbose_name="Référence dossier",
    )
    nom = models.CharField(max_length=100, verbose_name="Nom de famille")
    prenom = models.CharField(max_length=100, verbose_name="Prénom(s)")
    classe = models.CharField(
        max_length=10,
        choices=CLASSE_CHOICES,
        verbose_name="Classe",
    )
    etablissement = models.CharField(
        max_length=200,
        blank=True,
        default="",
        verbose_name="Nom du collège / établissement",
    )
    region_ville = models.CharField(
        max_length=100,
        blank=True,
        default="",
        verbose_name="Région ou Ville",
    )
    telephone_tuteur = models.CharField(
        max_length=30,
        validators=[validate_telephone_tuteur],
        verbose_name="Téléphone parent ou tuteur",
    )
    nom_tuteur = models.CharField(
        max_length=150,
        verbose_name="Nom du parent ou tuteur",
    )
    mascotte_nom = models.CharField(
        max_length=150,
        verbose_name="Nom proposé de la mascotte",
    )
    mascotte_pourquoi = models.TextField(
        blank=True,
        default="",
        verbose_name="Pourquoi ce nom (2 à 3 phrases)",
    )
    mascotte_signification = models.TextField(
        blank=True,
        default="",
        verbose_name="Ce que représente la mascotte",
    )
    mascotte_dessin = models.FileField(
        upload_to="mascottes/dessins/",
        validators=[validate_mascotte_dessin],
        verbose_name="Dessin de la mascotte (photo/scan/PDF)",
    )
    autorisation_parent = models.BooleanField(
        default=False,
        verbose_name="Autorisation parentale confirmée",
    )
    accord_utilisation_dessin = models.BooleanField(
        default=False,
        verbose_name="Accord d'utilisation du dessin par l'OPE",
    )
    statut = models.CharField(
        max_length=20,
        choices=STATUT_CHOICES,
        default="en_attente",
        verbose_name="Statut du dossier",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'inscription")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Dernière modification")

    class Meta:
        verbose_name = "Candidat Mascotte"
        verbose_name_plural = "Candidats Mascotte"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.reference:
            prefix = "MASC-2026"
            import secrets
            for _ in range(50):
                num = f"{secrets.randbelow(90000) + 10000:05d}"
                ref = f"{prefix}-{num}"
                if not CandidatMascotte.objects.filter(reference=ref).exists():
                    self.reference = ref
                    break
            else:
                import time
                self.reference = f"{prefix}-{int(time.time()) % 100000:05d}"
        if not self.statut:
            self.statut = "en_attente"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference} - {self.mascotte_nom} ({self.prenom} {self.nom}, {self.classe})"

class Actualite(models.Model):
    PHASE_CHOICES = [
        ("avant", "Avant le camp (Inscriptions, Préparatifs)"),
        ("pendant", "Pendant le camp (Direct, Ateliers)"),
        ("apres", "Après le camp (Bilans, Suivi des talents)"),
    ]

    titre = models.CharField(max_length=255, verbose_name="Titre")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="Lien / URL (Slug)")
    phase = models.CharField(max_length=10, choices=PHASE_CHOICES, default="avant", verbose_name="Phase de l'événement")
    badge_label = models.CharField(max_length=50, default="OFFICIEL", verbose_name="Badge (ex: OFFICIEL, WEBINAIRE...)")
    resume = models.TextField(verbose_name="Résumé")
    contenu = models.TextField(verbose_name="Contenu de l'article")
    image_principale = models.ImageField(upload_to="actualites/", verbose_name="Image de couverture")
    publie = models.BooleanField(default=True, verbose_name="Publié")
    date_publication = models.DateField(verbose_name="Date de publication")
    temps_lecture = models.PositiveIntegerField(default=3, verbose_name="Temps de lecture (minutes)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Actualité"
        verbose_name_plural = "Actualités"
        ordering = ["-date_publication", "-created_at"]

    def __str__(self):
        return self.titre

class MembreEquipe(models.Model):
    nom = models.CharField(max_length=150, verbose_name="Nom complet")
    role = models.CharField(max_length=150, verbose_name="Rôle / Titre (ex: COORDINATEUR GÉNÉRAL)")
    section = models.CharField(max_length=100, default="Coordination", verbose_name="Section")
    description = models.TextField(blank=True, verbose_name="Courte biographie")
    photo = models.ImageField(upload_to="equipe/", verbose_name="Photo")
    email = models.EmailField(blank=True, verbose_name="Email de contact")
    linkedin = models.URLField(blank=True, verbose_name="Lien LinkedIn")
    ordre = models.PositiveIntegerField(default=0, verbose_name="Ordre d'affichage")
    actif = models.BooleanField(default=True, verbose_name="Afficher sur le site")

    class Meta:
        verbose_name = "Membre de l'équipe"
        verbose_name_plural = "Membres de l'équipe"
        ordering = ["ordre", "nom"]

    def __str__(self):
        return f"{self.nom} - {self.role}"

class Partenaire(models.Model):
    TYPE_CHOICES = [
        ("pays", "Pays"),
        ("institution", "Institution"),
        ("ong", "ONG"),
        ("ambassade", "Ambassade"),
    ]

    CATEGORIE_CHOICES = [
        ("platine","Platine"),
        ("or","Or"),
        ("argent","Argent"),
        ("bronze", "Bronze"),
    ]

    nom = models.CharField(max_length=150, verbose_name="Nom du sponsor")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="institution", verbose_name="Niveau / Palier")
    logo = models.ImageField(upload_to="partenaires/", blank=True, null=True, verbose_name="Logo image")
    categorie = models.CharField(max_length=10, choices=CATEGORIE_CHOICES, default="bronze", verbose_name="Catégorie")
    statut = models.CharField(max_length=150, blank=True, default="Partenaire Officiel", verbose_name="Statut / Sous-titre")

    class Meta:
        verbose_name = "Partenaire / Sponsor"
        verbose_name_plural = "Partenaires & Sponsors"
        ordering = ["type", "nom", "logo"]

    def __str__(self):
        return f"{self.nom} ({self.get_categorie_display()})"

class MediaGalerie(models.Model):
    CATEGORIE_CHOICES = [
        ("steam", "Modèles STEAM"),
        ("local", "Local Projects (LP)"),
        ("citoyen", "Modèles de Citoyen Communautaire (MCC)"),
        ("ambiance", "Ambiance & Cérémonies"),
    ]

    titre = models.CharField(max_length=150, blank=True, verbose_name="Légende / Titre")
    categorie = models.CharField(max_length=20, choices=CATEGORIE_CHOICES, default="ambiance", verbose_name="Catégorie")
    image = models.ImageField(upload_to="galerie/", verbose_name="Image")
    video_url = models.URLField(blank=True, help_text="Lien YouTube / Vimeo si vidéo", verbose_name="Lien vidéo (Optionnel)")
    mis_en_avant = models.BooleanField(default=False, verbose_name="Afficher en grand / Accueil")
    ordre = models.PositiveIntegerField(default=0, verbose_name="Ordre")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Média Galerie"
        verbose_name_plural = "Galerie Multimédia"
        ordering = ["ordre", "-created_at"]

    def __str__(self):
        return self.titre or f"Média #{self.id} ({self.categorie})"

class MessageContact(models.Model):
    nom = models.CharField(max_length=150, verbose_name="Nom complet")
    email = models.EmailField(verbose_name="Email")
    sujet = models.CharField(max_length=200, verbose_name="Sujet")
    message = models.TextField(verbose_name="Message")
    traite = models.BooleanField(default=False, verbose_name="Traité par l'équipe")
    reponse_interne = models.TextField(blank=True, verbose_name="Note de réponse / Suivi")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date d'envoi")

    class Meta:
        verbose_name = "Message de contact"
        verbose_name_plural = "Messages de contact"
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.nom} : {self.sujet}"

class Document(models.Model):
    TYPE_CHOICES = [
        ("archive", "Archive"),
        ("talent", "Talent"),
        ("rapport", "Rapport"),
    ]
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="archive", verbose_name="Type de document")
    titre = models.CharField(max_length=150, verbose_name="Titre")
    fichier = models.FileField(upload_to="archives/", verbose_name="Fichier")
    annee = models.PositiveIntegerField(verbose_name="Year")
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)

    class Meta:
        verbose_name = "Document"
        verbose_name_plural = "Documents"
        ordering = ["-annee", "-created_at"]

    def __str__(self):
        return f"{self.titre} ({self.annee})"
