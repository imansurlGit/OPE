from rest_framework import  serializers
from . import models

class CandidatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Candidature
        fields = "__all__"
        extra_kwargs = {
            "reference": {"required": False},
            "statut": {"required": False},
            "photo_identite": {"required": False, "allow_null": True},
            "piece_identite": {"required": False, "allow_null": True},
            "bulletins_scolaires": {"required": False, "allow_null": True},
            "autorisation_parentale": {"required": False, "allow_null": True},
        }

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
        read_only_fields = ["id", "traite", "reponse_interne", "created_at"]

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