from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from . import models, serializers as sz

class CandidatureViewSet(viewsets.GenericViewSet):
    queryset = models.Candidature.objects.all()
    serializer_class = sz.CandidatureSerializer()

    def get_permissions(self):
        if self.action == 'card':
            permission_class = [permissions.AllowAny]
        else:
            permission_class = [permissions.IsAuthenticated]
        return [permissions() for permissions in permission_class]


    def list(self, request):
        return Response({"status": "ok"})

    def create(self, requuest):
        return Response({"status": "ok"})
