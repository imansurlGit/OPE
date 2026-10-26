from django.urls import path, include
from rest_framework import routers
from . import views

router = routers.DefaultRouter()
router.register(r'candidatures', views.CandidatMascotteViewSet, basename='mascotte-candidature')

urlpatterns = [
    path('', include(router.urls)),
]
