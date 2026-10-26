from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile
from django.contrib.auth import get_user_model
from .models import CandidatMascotte

User = get_user_model()

class CandidatMascotteAPITests(APITestCase):
    def setUp(self):
        # Création d'une image PNG valide minimale (header 8 octets)
        self.valid_png_content = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
        self.valid_file = SimpleUploadedFile(
            "mascotte.png",
            self.valid_png_content,
            content_type="image/png"
        )
        self.valid_payload = {
            "nom": "Harouna",
            "prenom": "Amina",
            "classe": "4e",
            "etablissement": "CEG 1 Agadez",
            "region_ville": "Agadez",
            "telephone_tuteur": "+227 90 12 34 56",
            "nom_tuteur": "Idrissa Harouna",
            "mascotte_nom": "Taghalam le Fennec",
            "mascotte_pourquoi": "Car il est rusé et agile dans le désert du Ténéré.",
            "mascotte_signification": "Symbole de vivacité et d'ingéniosité scientifique.",
            "mascotte_dessin": self.valid_file,
            "autorisation_parent": "true",
            "accord_utilisation_dessin": "true",
        }

    def test_creation_valide_candidature_mascotte(self):
        """Vérifie la création réussie d'une candidature avec code 201 et référence générée."""
        response = self.client.post(
            "/api/mascotte/candidatures/",
            self.valid_payload,
            format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertTrue(response.data.get("success"))
        self.assertIn("reference", response.data)
        self.assertTrue(response.data["reference"].startswith("MASC-2026-"))
        self.assertEqual(response.data["mascotte_nom"], "Taghalam le Fennec")
        
        # Règle transversale : aucune fuite de données personnelles ou d'âge dans la réponse publique
        self.assertNotIn("age", response.data)
        self.assertNotIn("date_naissance", response.data)
        self.assertNotIn("telephone_tuteur", response.data)

        # Vérification en base de données
        obj = CandidatMascotte.objects.get(reference=response.data["reference"])
        self.assertEqual(obj.nom, "Harouna")
        self.assertEqual(obj.statut, "en_attente")
        self.assertTrue(obj.autorisation_parent)
        self.assertTrue(obj.accord_utilisation_dessin)

    def test_champs_obligatoires_manquants(self):
        """Vérifie qu'une erreur 400 est renvoyée si des champs requis manquent."""
        invalid_payload = {
            "nom": "",
            "prenom": "",
            "classe": "terminale",  # Classe invalide
            "telephone_tuteur": "",
            "nom_tuteur": "",
            "mascotte_nom": "",
        }
        response = self.client.post(
            "/api/mascotte/candidatures/",
            invalid_payload,
            format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("nom", response.data)
        self.assertIn("prenom", response.data)
        self.assertIn("classe", response.data)
        self.assertIn("telephone_tuteur", response.data)
        self.assertIn("nom_tuteur", response.data)
        self.assertIn("mascotte_nom", response.data)

    def test_cases_autorisation_non_cochees(self):
        """Vérifie que les autorisations parentales sont obligatoirement True."""
        file = SimpleUploadedFile("dessin.png", self.valid_png_content, content_type="image/png")
        payload = self.valid_payload.copy()
        payload["mascotte_dessin"] = file
        payload["autorisation_parent"] = "false"
        payload["accord_utilisation_dessin"] = "false"

        response = self.client.post(
            "/api/mascotte/candidatures/",
            payload,
            format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("autorisation_parent", response.data)
        self.assertIn("accord_utilisation_dessin", response.data)

    def test_fichier_type_interdit(self):
        """Vérifie qu'un fichier dont l'extension ou le contenu est interdit est rejeté avec 400."""
        invalid_file = SimpleUploadedFile("script.exe", b"binary content", content_type="application/octet-stream")
        payload = self.valid_payload.copy()
        payload["mascotte_dessin"] = invalid_file

        response = self.client.post(
            "/api/mascotte/candidatures/",
            payload,
            format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("mascotte_dessin", response.data)

    def test_fichier_fausse_extension(self):
        """Vérifie la détection d'un fichier trompeur (extension .png mais contenu texte)."""
        fake_png = SimpleUploadedFile("malicious.png", b"ceci n'est pas une image", content_type="image/png")
        payload = self.valid_payload.copy()
        payload["mascotte_dessin"] = fake_png

        response = self.client.post(
            "/api/mascotte/candidatures/",
            payload,
            format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("mascotte_dessin", response.data)

    def test_fichier_trop_volumineux(self):
        """Vérifie qu'un fichier > 10 Mo est rejeté avec 400."""
        # 11 Mo
        large_content = b"\x89PNG\r\n\x1a\n" + b"\x00" * (11 * 1024 * 1024)
        large_file = SimpleUploadedFile("huge.png", large_content, content_type="image/png")
        payload = self.valid_payload.copy()
        payload["mascotte_dessin"] = large_file

        response = self.client.post(
            "/api/mascotte/candidatures/",
            payload,
            format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("mascotte_dessin", response.data)

    def test_honeypot_antispam_rejet(self):
        """Vérifie que si le champ honeypot 'website' est rempli, la requête est rejetée."""
        file = SimpleUploadedFile("dessin.png", self.valid_png_content, content_type="image/png")
        payload = self.valid_payload.copy()
        payload["mascotte_dessin"] = file
        payload["website"] = "http://spam-bot.com"

        response = self.client.post(
            "/api/mascotte/candidatures/",
            payload,
            format="multipart"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_liste_candidatures_interdite_sans_authentification(self):
        """Vérifie que la lecture publique GET /api/mascotte/candidatures/ est interdite (401/403)."""
        response = self.client.get("/api/mascotte/candidatures/")
        self.assertIn(response.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_liste_candidatures_autorisee_pour_admin(self):
        """Vérifie que l'administrateur peut consulter la liste des candidatures."""
        admin_user = User.objects.create_superuser("admin_test", "admin@test.com", "AdminPass123!")
        self.client.force_authenticate(user=admin_user)
        response = self.client.get("/api/mascotte/candidatures/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
