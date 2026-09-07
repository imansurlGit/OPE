from rest_framework import  serializers
from . import models

class CandidatureSerializer(serializers.ModelSerializer):
    class Meta:
        models = models.Candidature
        fields = "__all__"