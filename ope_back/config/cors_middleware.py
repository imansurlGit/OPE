from django.http import HttpResponse
from django.utils.deprecation import MiddlewareMixin


class SimpleCorsMiddleware(MiddlewareMixin):
    """
    Middleware CORS universel pour autoriser les requêtes du frontend local (Vite, React, etc.)
    Gère les requêtes preflight OPTIONS et injecte les en-têtes Access-Control.
    """

    def process_request(self, request):
        if request.method == "OPTIONS":
            response = HttpResponse()
            origin = request.headers.get("Origin", "*")
            response["Access-Control-Allow-Origin"] = origin
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
            response["Access-Control-Allow-Headers"] = (
                "Content-Type, Authorization, X-Requested-With, Accept, Origin"
            )
            response["Access-Control-Allow-Credentials"] = "true"
            response["Access-Control-Max-Age"] = "86400"
            return response

    def process_response(self, request, response):
        origin = request.headers.get("Origin", "*")
        response["Access-Control-Allow-Origin"] = origin
        response["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response["Access-Control-Allow-Headers"] = (
            "Content-Type, Authorization, X-Requested-With, Accept, Origin"
        )
        response["Access-Control-Allow-Credentials"] = "true"
        return response
