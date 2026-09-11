from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from config import settings
from .serializers import CustomTokenObtainPairSerializer, CustomTokenRefreshSerializer


class CustomLoginView(TokenObtainPairView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Récupération des tokens validés
            access_token = serializer.validated_data.get('access')
            refresh_token = serializer.validated_data.get('refresh')
            user_data = serializer.validated_data.get('user')

            # Instanciation de LA réponse qui sera retournée
            response = Response({
                "success": True,
                "access": access_token,
                "refresh": refresh_token,
                "user": user_data,
                "message": "Connecté avec succes",
                "status_code": status.HTTP_200_OK,
            }, status=status.HTTP_200_OK)

            # Ajout des cookies à CETTE réponse
            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                samesite='Lax',
                secure=not settings.DEBUG,
                max_age=getattr(settings, 'ACCESS_COOKIE_AGE', 86400),
            )
            response.set_cookie(
                key='refresh_token',
                value=refresh_token,
                httponly=True,
                samesite='Lax',
                secure=not settings.DEBUG,
                max_age=getattr(settings, 'REFRESH_COOKIE_AGE', 604800),
            )

            return response

        return Response({
            "success": False,
            "errors": serializer.errors,
            "message": "Erreur d'authentification",
            "status_code": status.HTTP_400_BAD_REQUEST,
        }, status=status.HTTP_400_BAD_REQUEST)


class CustomRefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    serializer_class = CustomTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        # Si le refresh_token n'est pas envoyé dans le body JSON, le lire depuis le cookie HTTP
        req_data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
        if not req_data.get('refresh') and 'refresh_token' in request.COOKIES:
            req_data['refresh'] = request.COOKIES['refresh_token']

        serializer = self.get_serializer(data=req_data)
        if serializer.is_valid():
            access_token = serializer.validated_data.get('access')
            refresh_token = serializer.validated_data.get('refresh')
            user_data = serializer.validated_data.get('user')

            response = Response({
                "access": access_token,
                "user": user_data,
                "success": True,
                "message": "Refresh token restauré",
                "status_code": status.HTTP_200_OK,
            }, status=status.HTTP_200_OK)

            response.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                samesite='Lax',
                secure=not settings.DEBUG,
                max_age=getattr(settings, 'ACCESS_COOKIE_AGE', 86400),
            )
            if refresh_token:
                response.set_cookie(
                    key='refresh_token',
                    value=refresh_token,
                    httponly=True,
                    samesite='Lax',
                    secure=not settings.DEBUG,
                    max_age=getattr(settings, 'REFRESH_COOKIE_AGE', 604800),
                )
            return response

        return Response({
            "success": False,
            "errors": serializer.errors,
            "message": "Refresh token invalide ou expiré",
            "status_code": status.HTTP_401_UNAUTHORIZED,
        }, status=status.HTTP_401_UNAUTHORIZED)
