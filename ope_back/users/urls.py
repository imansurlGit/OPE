from django.urls import path, include
from . import  views

urlpatterns = [
    path('login/', views.CustomLoginView.as_view()),
    path('refresh/', views.CustomRefreshView.as_view()),
]