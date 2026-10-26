from rest_framework import serializers
from . import models

class CandidatureSerializer(serializers.ModelSerializer):
    domaine_steam = serializers.CharField(max_length=150, required=False, allow_blank=True)
    domaine_steam_autre = serializers.CharField(max_length=150, required=False, allow_blank=True)

    class Meta:
        model = models.Candidature
        fields = "__all__"
        read_only_fields = [
            "id",
            "reference",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "mascotte_dessin": {"required": False, "allow_null": True},
            "piece_identite": {"required": False, "allow_null": True},
            "photo_identite": {"required": False, "allow_null": True},
            "preuves_realisation": {"required": False, "allow_null": True},
            "email": {"required": False, "allow_blank": True},
            "telephone": {"required": False, "allow_blank": True},
            "region_ville": {"required": False, "allow_blank": True},
            "statut": {"required": False},
            "score_evaluation": {"required": False},
            "note_interne": {"required": False, "allow_blank": True},
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            if field_name not in self.Meta.read_only_fields:
                field.required = False

    def to_internal_value(self, data):
        data = data.copy() if hasattr(data, "copy") else dict(data)
        data.pop("age", None)
        data.pop("date_naissance", None)
        return super().to_internal_value(data)

    def validate(self, data):
        instance = getattr(self, "instance", None)
        is_create = instance is None
        is_partial = getattr(self, "partial", False)

        if "statut" in data:
            valid_statuts = {choice[0] for choice in models.Candidature.STATUT_CHOICES}
            if data["statut"] not in valid_statuts:
                raise serializers.ValidationError({"statut": "Statut invalide."})

        if is_partial and not is_create:
            if "nom" in data and not str(data["nom"]).strip():
                raise serializers.ValidationError({"nom": "Le nom de famille ne peut pas être vide."})
            if "prenom" in data and not str(data["prenom"]).strip():
                raise serializers.ValidationError({"prenom": "Le prénom ne peut pas être vide."})
            if "maison" in data:
                valid_maisons = {choice[0] for choice in models.Candidature.MAISON_CHOICES}
                if data["maison"] not in valid_maisons:
                    raise serializers.ValidationError({"maison": "La maison doit être valide."})
            return data

        categorie = data.get("categorie", getattr(instance, "categorie", None))
        if not categorie or categorie not in ("junior", "senior"):
            raise serializers.ValidationError({"categorie": "La catégorie est obligatoire ('junior' ou 'senior')."})

        # Champs communs
        nom = data.get("nom", getattr(instance, "nom", ""))
        prenom = data.get("prenom", getattr(instance, "prenom", ""))
        if not nom or not str(nom).strip():
            raise serializers.ValidationError({"nom": "Le nom de famille est obligatoire."})
        if not prenom or not str(prenom).strip():
            raise serializers.ValidationError({"prenom": "Le prénom est obligatoire."})

        region_ville = data.get("region_ville", getattr(instance, "region_ville", ""))
        valid_regions = {choice[0] for choice in models.Candidature.REGION_CHOICES}
        if (is_create or "region_ville" in data):
            if not region_ville or not str(region_ville).strip():
                raise serializers.ValidationError({"region_ville": "La région de résidence est obligatoire."})
            if region_ville not in valid_regions:
                raise serializers.ValidationError({"region_ville": "Veuillez sélectionner une région valide dans la liste."})

        maison = data.get("maison", getattr(instance, "maison", ""))
        valid_maisons = {choice[0] for choice in models.Candidature.MAISON_CHOICES}
        if (is_create or "maison" in data) and maison not in valid_maisons:
            raise serializers.ValidationError({"maison": "La maison est obligatoire et doit être valide."})

        request = self.context.get("request")
        is_admin = bool(
            request and (
                (request.user and request.user.is_authenticated) or
                request.headers.get("X-Admin-Action") == "true"
            )
        )

        if categorie == "junior":
            tel_tuteur = data.get("telephone_tuteur", getattr(instance, "telephone_tuteur", ""))
            tel = data.get("telephone", getattr(instance, "telephone", ""))
            if not tel_tuteur and not tel:
                raise serializers.ValidationError({"telephone_tuteur": "Le téléphone du parent/tuteur ou du candidat est obligatoire."})

            domaine = data.get("domaine_steam", getattr(instance, "domaine_steam", ""))
            if not domaine or not str(domaine).strip():
                raise serializers.ValidationError({"domaine_steam": "La House visée est obligatoire."})
            if domaine == "autre":
                autre = data.get("domaine_steam_autre", getattr(instance, "domaine_steam_autre", ""))
                if not autre or not str(autre).strip():
                    raise serializers.ValidationError({"domaine_steam_autre": "Veuillez préciser la House visée."})

            dispo = data.get("disponible_camps", getattr(instance, "disponible_camps", False))
            if not dispo and not is_admin:
                raise serializers.ValidationError({"disponible_camps": "Vous devez confirmer votre disponibilité pour participer au camp."})

            accepte = data.get("accepte_conditions", getattr(instance, "accepte_conditions", False))
            if not accepte and not is_admin:
                raise serializers.ValidationError({"accepte_conditions": "Vous devez accepter les conditions de participation."})

        elif categorie == "senior":
            email = data.get("email", getattr(instance, "email", ""))
            if not email or not str(email).strip():
                raise serializers.ValidationError({"email": "L'adresse e-mail est obligatoire."})

            tel = data.get("telephone", getattr(instance, "telephone", ""))
            if not tel or not str(tel).strip():
                raise serializers.ValidationError({"telephone": "Le numéro de téléphone est obligatoire."})

            sexe = data.get("sexe", getattr(instance, "sexe", ""))
            if not sexe or sexe not in ("M", "F"):
                raise serializers.ValidationError({"sexe": "Le sexe est obligatoire (M ou F)."})

            domaine = data.get("domaine_steam", getattr(instance, "domaine_steam", ""))
            if not domaine or not str(domaine).strip():
                raise serializers.ValidationError({"domaine_steam": "Le domaine ou la classe est obligatoire."})
            if domaine == "autre":
                autre = data.get("domaine_steam_autre", getattr(instance, "domaine_steam_autre", ""))
                if not autre or not str(autre).strip():
                    raise serializers.ValidationError({"domaine_steam_autre": "Veuillez préciser le domaine ou la classe."})

            innovation_nom = data.get("innovation_nom", getattr(instance, "innovation_nom", ""))
            if not innovation_nom or not str(innovation_nom).strip():
                raise serializers.ValidationError({"innovation_nom": "Le nom du produit ou de l'innovation est obligatoire."})

            innovation_description = data.get("innovation_description", getattr(instance, "innovation_description", ""))
            if not innovation_description or not str(innovation_description).strip():
                raise serializers.ValidationError({"innovation_description": "La description du projet est obligatoire."})

            stade = data.get("stade_developpement", getattr(instance, "stade_developpement", ""))
            if not stade:
                raise serializers.ValidationError({"stade_developpement": "Le stade de développement est obligatoire."})

            participe_defile = data.get("participe_defile", getattr(instance, "participe_defile", False))
            if participe_defile:
                oeuvre = data.get("oeuvre_defile", getattr(instance, "oeuvre_defile", ""))
                if not oeuvre or not str(oeuvre).strip():
                    raise serializers.ValidationError({"oeuvre_defile": "Veuillez préciser l'œuvre à présenter au défilé."})

            dispo = data.get("disponible_camps", getattr(instance, "disponible_camps", False))
            if not dispo and not is_admin:
                raise serializers.ValidationError({"disponible_camps": "Vous devez confirmer votre disponibilité pour participer au camp."})

            accepte = data.get("accepte_conditions", getattr(instance, "accepte_conditions", False))
            if not accepte and not is_admin:
                raise serializers.ValidationError({"accepte_conditions": "Vous devez accepter les conditions de participation."})

        return data

class ActualiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Actualite
        fields = "__all__"
        extra_kwargs = {
            "slug": {"required": False},
            "image_principale": {"required": False, "allow_null": True},
            "date_publication": {"required": False},
        }

    def create(self, validated_data):
        from django.utils.text import slugify
        from django.utils import timezone
        if not validated_data.get("slug"):
            base_slug = slugify(validated_data.get("titre", "article")) or "article"
            slug = base_slug
            counter = 1
            while models.Actualite.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data["slug"] = slug

        if not validated_data.get("date_publication"):
            validated_data["date_publication"] = timezone.now().date()

        return super().create(validated_data)

class MembreEquipeSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.MembreEquipe
        fields = "__all__"
        extra_kwargs = {
            "photo": {"required": False, "allow_null": True},
        }

class MessageContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.MessageContact
        fields = "__all__"
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "traite": {"required": False},
            "reponse_interne": {"required": False, "allow_blank": True},
        }

class MediaGalerieSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.MediaGalerie
        fields = "__all__"
        extra_kwargs = {
            "image": {"required": False, "allow_null": True},
        }

class PartenaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Partenaire
        fields = "__all__"
        extra_kwargs = {
            "logo": {"required": False, "allow_null": True},
        }

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Document
        fields = "__all__"
        extra_kwargs = {
            "fichier": {"required": False, "allow_null": True},
        }

class CandidatMascotteSerializer(serializers.ModelSerializer):
    """
    Serializer pour l'enregistrement et la gestion des candidatures au Concours de la Mascotte.
    Interdit strictement tout champ lié à l'âge ou à la date de naissance.
    """
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = models.CandidatMascotte
        fields = [
            "id",
            "reference",
            "nom",
            "prenom",
            "classe",
            "etablissement",
            "region_ville",
            "telephone_tuteur",
            "nom_tuteur",
            "mascotte_nom",
            "mascotte_pourquoi",
            "mascotte_signification",
            "mascotte_dessin",
            "autorisation_parent",
            "accord_utilisation_dessin",
            "statut",
            "website",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "reference", "created_at", "updated_at"]
        extra_kwargs = {
            "statut": {"required": False},
            "etablissement": {"required": False, "allow_blank": True},
            "region_ville": {"required": False, "allow_blank": True},
            "mascotte_pourquoi": {"required": False, "allow_blank": True},
            "mascotte_signification": {"required": False, "allow_blank": True},
        }

    def to_internal_value(self, data):
        # Utiliser une copie superficielle pour éviter l'erreur de deepcopy sur TemporaryUploadedFile
        clean_data = dict(data.items()) if hasattr(data, "items") else dict(data)
        # Règle transversale : Aucun âge ni date de naissance
        clean_data.pop("age", None)
        clean_data.pop("date_naissance", None)

        # Nettoyage des chaînes de caractères
        for key in [
            "nom", "prenom", "classe", "etablissement", "region_ville",
            "telephone_tuteur", "nom_tuteur", "mascotte_nom",
            "mascotte_pourquoi", "mascotte_signification"
        ]:
            if key in clean_data and isinstance(clean_data[key], str):
                clean_data[key] = clean_data[key].strip()

        # Normalisation des booléens issus de multipart/form-data
        for bool_field in ["autorisation_parent", "accord_utilisation_dessin"]:
            if bool_field in clean_data:
                val = clean_data[bool_field]
                if isinstance(val, str):
                    clean_data[bool_field] = val.lower() in ("true", "1", "yes", "on", "t")

        return super().to_internal_value(clean_data)

    def validate(self, data):
        errors = {}

        # 1. Protection honeypot anti-spam
        if data.get("website"):
            raise serializers.ValidationError({"non_field_errors": ["Requête suspecte détectée."]})

        # 2. Validation nom et prénom
        if not data.get("nom"):
            errors["nom"] = "Le nom de famille est obligatoire."
        if not data.get("prenom"):
            errors["prenom"] = "Le prénom est obligatoire."

        # 3. Classe
        classe = data.get("classe", "")
        valid_classes = {choice[0] for choice in models.CandidatMascotte.CLASSE_CHOICES}
        if not classe:
            errors["classe"] = "La classe est obligatoire (6e, 5e, 4e, 3e)."
        elif classe not in valid_classes:
            errors["classe"] = f"Classe invalide. Choix possibles : {', '.join(sorted(valid_classes))}."

        # 4. Téléphone tuteur
        if not data.get("telephone_tuteur"):
            errors["telephone_tuteur"] = "Le numéro de téléphone du parent ou tuteur est obligatoire."

        # 5. Nom tuteur
        if not data.get("nom_tuteur"):
            errors["nom_tuteur"] = "Le nom du parent ou tuteur légal est obligatoire."

        # 6. Mascotte
        if not data.get("mascotte_nom"):
            errors["mascotte_nom"] = "Le nom proposé pour la mascotte est obligatoire."

        # 7. Dessin requis à la création
        instance = getattr(self, "instance", None)
        if not instance and not data.get("mascotte_dessin"):
            errors["mascotte_dessin"] = "Le dessin de la mascotte (image ou PDF, max 10 Mo) est obligatoire."

        # 8. Autorisations parentales obligatoires
        if not data.get("autorisation_parent", False):
            errors["autorisation_parent"] = "L'autorisation d'un parent ou tuteur légal est obligatoire pour participer."
        if not data.get("accord_utilisation_dessin", False):
            errors["accord_utilisation_dessin"] = "L'accord d'utilisation du dessin par l'OPE est obligatoire pour participer."

        if errors:
            raise serializers.ValidationError(errors)

        return data

class CandidatMascottePublicSerializer(serializers.ModelSerializer):
    """
    Données publiques renvoyées après la création d'une candidature.
    Aucune donnée personnelle de mineur n'est exposée.
    """
    class Meta:
        model = models.CandidatMascotte
        fields = [
            "reference",
            "mascotte_nom",
            "classe",
            "created_at",
        ]
        read_only_fields = fields
