from django.urls import path, include
from rest_framework import routers

from . import  views

router = routers.DefaultRouter()
router.register(r'candidatures', views.CandidatureViewSet, basename='candidature')
router.register(r'actualites', views.ActualiteViewSet, basename='actualite')
router.register(r'membres', views.MembreEquipeViewSet, basename='membre')
router.register(r'contacts', views.MessageContactViewSet, basename='contact')
router.register(r'galerie', views.MediaGalerieViewSet, basename='galerie')
router.register(r'partenaires', views.PartenaireViewSet, basename='partenaire')


urlpatterns = [
    path('', include(router.urls))
]