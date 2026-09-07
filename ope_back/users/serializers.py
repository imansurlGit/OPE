from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import RefreshToken


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']

# Surcharge du Serializer JWT
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # 1. Vérifie le username et password
        data = super().validate(attrs)

        # 2. Ajoute les informations de l'utilisateur à la réponse JSON
        data['user'] = UserSerializer(self.user).data
        return data

class CustomTokenRefreshSerializer(TokenRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        refresh = RefreshToken(attrs['refresh'])
        user_id = refresh.get('user_id')

        if user_id:
            user = User.objects.get(pk=user_id)
            data['user'] = UserSerializer(user).data

            return  data