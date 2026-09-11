from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator

class Candidature(models.Model):
    DOMAINE_CHOICES = [
        ("STEAM", "STEAM (Sciences, Tech, Ingénierie, Art, Maths)"),
        ("LP", "LP (Local Projects / Entrepreneuriat local)"),
        ("MCC", "MCC (Modèle de Citoyen Communautaire)"),
    ]

    SEXE_CHOICES = [
        ("M", "Masculin"),
        ("F", "Féminin"),
    ]

    STATUT_CHOICES = [
        ("soumis", "Dossier soumis"),
        ("en_revue", "En cours d'examen"),
        ("preselectionne", "Pré-sélectionné (Pré-camp)"),
        ("admis", "Admis au Camp National"),
        ("rejete", "Non retenu"),
    ]

    NUMERIQUE_CHOICES = [
        ("perso", "Oui personnellement"),
        ("tiers", "Oui avec l'aide d'un tiers"),
        ("sur_place", "Non mais je m'organiserai sur place"),
    ]

    # Référence unique générée
    reference = models.CharField(max_length=50, unique=True, verbose_name="N° Dossier", blank=True)

    # Étape 1 : Domaine
    domaine = models.CharField(max_length=10, choices=DOMAINE_CHOICES, verbose_name="Domaine / House")

    # Étape 2 : Identité
    nom = models.CharField(max_length=100, verbose_name="Nom de famille")
    prenom = models.CharField(max_length=100, verbose_name="Prénom(s)")
    date_naissance = models.DateField(verbose_name="Date de naissance")
    sexe = models.CharField(max_length=1, choices=SEXE_CHOICES, verbose_name="Sexe")
    region = models.CharField(max_length=50, verbose_name="Région")
    ville_village = models.CharField(max_length=120, verbose_name="Ville ou Village")
    nationalite = models.CharField(max_length=80, default="Nigérienne", verbose_name="Nationalité")
    etablissement = models.CharField(max_length=200, blank=True, verbose_name="Établissement / École")
    classe = models.CharField(max_length=100, blank=True, verbose_name="Classe / Niveau")
    telephone_candidat = models.CharField(max_length=30, blank=True, verbose_name="Tél Candidat")
    email = models.EmailField(verbose_name="Email")
    telephone_tuteur = models.CharField(max_length=30, blank=True, verbose_name="Tél Parent/Tuteur")
    point_focal = models.CharField(max_length=150, blank=True, verbose_name="Point Focal OPE")
    biographie = models.TextField(blank=True, help_text="Max 100 mots", verbose_name="Biographie")

    # Étape 3 : House & Projet
    house_visee = models.CharField(max_length=150, verbose_name="House spécifique")
    house_visee_autre = models.CharField(max_length=200, blank=True, verbose_name="Précision autre projet")
    statut_projet = models.CharField(max_length=255, verbose_name="État d'avancement")
    description_projet = models.TextField(verbose_name="Description du projet / vocation")
    filiere = models.CharField(max_length=150, blank=True, verbose_name="Filière (STEAM/LP)")
    moyenne_recente = models.CharField(max_length=50, blank=True, verbose_name="Moyenne / Résultat")
    nom_recommandant = models.CharField(max_length=150, blank=True, verbose_name="Nom recommandant")
    tel_recommandant = models.CharField(max_length=30, blank=True, verbose_name="Tél recommandant")
    frequence_engagement = models.CharField(max_length=50, blank=True, verbose_name="Fréquence engagement (MCC)")

    # Étape 4 : Motivation & Numérique
    motivation = models.TextField(verbose_name="Motivation pour le CNCEIZ")
    acces_numerique = models.CharField(max_length=100, default="Oui personnellement", verbose_name="Accès numérique")

    # Étape 5 : Pièces jointes
    photo_identite = models.ImageField(upload_to="candidatures/photos/", verbose_name="Photo d'identité", blank=True, null=True)
    piece_identite = models.FileField(upload_to="candidatures/pieces/", verbose_name="Pièce d'identité", blank=True, null=True)
    bulletins_scolaires = models.FileField(upload_to="candidatures/bulletins/", blank=True, null=True, verbose_name="Bulletins (STEAM)")
    autorisation_parentale = models.FileField(upload_to="candidatures/autorisations/", blank=True, null=True, verbose_name="Autorisation parentale (Mineur)")
    preuve_projet = models.FileField(upload_to="candidatures/preuves/", blank=True, null=True, verbose_name="Preuve projet (Optionnel)")
    lettre_recommandation = models.FileField(upload_to="candidatures/lettres/", blank=True, null=True, verbose_name="Lettre recommandation (Optionnel)")

    # Déclarations
    certification = models.BooleanField(default=False, verbose_name="Déclaration sur l'honneur")
    confirmation_parent = models.BooleanField(default=False, verbose_name="Accord parental confirmé")

    # Gestion interne / Admin
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default="admis", verbose_name="Statut du dossier")
    note_interne = models.TextField(blank=True, verbose_name="Notes / Remarques admin")
    score_evaluation = models.IntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)], verbose_name="Score /100")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Date de soumission")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Candidature"
        verbose_name_plural = "Candidatures"
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.reference:
            import random
            while True:
                num = random.randint(10000, 99999)
                ref = f"CNCEIZ-2026-{num}"
                if not Candidature.objects.filter(reference=ref).exists():
                    self.reference = ref
                    break
        if not self.statut:
            self.statut = "admis"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.reference} - {self.prenom} {self.nom} ({self.domaine})"

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

    nom = models.CharField(max_length=150, verbose_name="Nom du sponsor")
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="argent", verbose_name="Niveau / Palier")
    logo = models.ImageField(upload_to="partenaires/", blank=True, null=True, verbose_name="Logo image")

    class Meta:
        verbose_name = "Partenaire / Sponsor"
        verbose_name_plural = "Partenaires & Sponsors"
        ordering = ["type", "nom", "logo"]

    def __str__(self):
        return f"{self.nom} ({self.get_tier_display()})"

class MediaGalerie(models.Model):
    CATEGORIE_CHOICES = [
        ("steam", "Modèles STEAM"),
        ("local", "Local Projects (LP)"),
        ("citoyen", "Actions Citoyennes (MCC)"),
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