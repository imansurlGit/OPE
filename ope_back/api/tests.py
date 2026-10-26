from rest_framework.test import APITestCase
from rest_framework import status
from django.core.files.uploadedfile import SimpleUploadedFile

from .models import Candidature


class CandidatureMaisonIntegrationTests(APITestCase):
    def senior_payload(self):
        return {
            "categorie": "senior",
            "maison": "local_project",
            "nom": "Test",
            "prenom": "Candidat",
            "sexe": "M",
            "region_ville": "Agadez",
            "telephone": "+227 90 12 34 56",
            "email": "candidat@example.com",
            "domaine_steam": "robotique",
            "innovation_nom": "Projet test",
            "innovation_description": "Description du projet test",
            "stade_developpement": "prototype",
            "disponible_camps": "true",
            "accepte_conditions": "true",
        }

    def junior_payload(self):
        dessin = SimpleUploadedFile("dessin.png", b"fake image content", content_type="image/png")
        return {
            "categorie": "junior",
            "maison": "steam",
            "nom": "Test",
            "prenom": "Junior",
            "classe": "4e",
            "etablissement": "CEG Agadez",
            "region_ville": "Agadez",
            "telephone_tuteur": "+227 90 11 22 33",
            "mascotte_nom": "Taghalam",
            "mascotte_pourquoi": "Pour le courage",
            "mascotte_dessin": dessin,
            "mascotte_signification": "Symbole d'Agadez",
            "nom_tuteur": "Tuteur Test",
            "autorisation_parent": "true",
            "accord_utilisation_dessin": "true",
        }

    def test_create_candidature_saves_selected_maison(self):
        payload = self.senior_payload()
        response = self.client.post(
            "/api/candidatures/",
            payload,
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["maison"], "local_project")
        self.assertTrue(Candidature.objects.filter(maison="local_project").exists())

        filtered_response = self.client.get("/api/candidatures/?maison=local_project")
        self.assertEqual(filtered_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(filtered_response.data), 1)
        self.assertEqual(filtered_response.data[0]["maison"], "local_project")

    def test_senior_submission_uses_only_current_frontend_field_names(self):
        payload = self.senior_payload()
        response = self.client.post(
            "/api/candidatures/",
            payload,
            format="multipart",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["domaine_steam"], "robotique")
        self.assertEqual(response.data["region_ville"], "Agadez")
        self.assertEqual(response.data["maison"], "local_project")

    def test_senior_missing_frontend_required_fields_returns_current_field_errors(self):
        frontend_fields = ("domaine_steam", "sexe", "region_ville", "email")
        legacy_fields = {
            "domaine",
            "region",
            "ville_village",
            "house_visee",
            "statut_projet",
            "description_projet",
            "motivation",
            "date_naissance",
        }

        for field_name in frontend_fields:
            with self.subTest(field=field_name):
                payload = self.senior_payload()
                payload.pop(field_name)
                response = self.client.post(
                    "/api/candidatures/",
                    payload,
                    format="multipart",
                )

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn(field_name, response.data)
                self.assertTrue(legacy_fields.isdisjoint(response.data), response.data)

    def test_mouvement_citoyen_maison_uses_mc2_display_label(self):
        candidature = Candidature.objects.create(
            categorie="senior",
            maison="mouvement_citoyen",
            nom="Test",
            prenom="Candidat",
        )

        self.assertEqual(
            candidature.get_maison_display(),
            "Modèle Citoyen Communautaire ou MC2",
        )

    def test_create_candidature_rejects_missing_or_invalid_maison(self):
        payload = self.senior_payload()
        payload.pop("maison")

        missing_response = self.client.post(
            "/api/candidatures/",
            payload,
            format="multipart",
        )
        payload["maison"] = "unknown"
        invalid_response = self.client.post(
            "/api/candidatures/",
            payload,
            format="multipart",
        )

        self.assertEqual(missing_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("maison", missing_response.data)
        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("maison", invalid_response.data)

    def test_senior_submission_succeeds_without_date_naissance(self):
        payload = self.senior_payload()
        self.assertNotIn("date_naissance", payload)
        response = self.client.post(
            "/api/candidatures/",
            payload,
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_junior_submission_succeeds_without_age(self):
        payload = self.junior_payload()
        self.assertNotIn("age", payload)
        response = self.client.post(
            "/api/candidatures/",
            payload,
            format="multipart",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)

    def test_retrocompatibility_ignores_legacy_age_and_date_naissance(self):
        # Legacy senior request sending date_naissance
        senior_data = self.senior_payload()
        senior_data["date_naissance"] = "2000-01-01"
        res_senior = self.client.post("/api/candidatures/", senior_data, format="multipart")
        self.assertEqual(res_senior.status_code, status.HTTP_201_CREATED, res_senior.data)

        # Legacy junior request sending age
        junior_data = self.junior_payload()
        junior_data["age"] = "14"
        res_junior = self.client.post("/api/candidatures/", junior_data, format="multipart")
        self.assertEqual(res_junior.status_code, status.HTTP_201_CREATED, res_junior.data)

    def test_partial_update_statut_note_score(self):
        candidature = Candidature.objects.create(
            categorie="senior",
            maison="steam",
            nom="Test",
            prenom="Candidat",
            statut="soumis",
        )
        response = self.client.patch(
            f"/api/candidatures/{candidature.id}/",
            {"statut": "admis", "note_interne": "Retenu par le jury", "score_evaluation": 95},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        candidature.refresh_from_db()
        self.assertEqual(candidature.statut, "admis")
        self.assertEqual(candidature.note_interne, "Retenu par le jury")
        self.assertEqual(candidature.score_evaluation, 95)

    def test_junior_requires_region_ville(self):
        payload = self.junior_payload()
        payload.pop("region_ville")
        response = self.client.post("/api/candidatures/", payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("region_ville", response.data)

    def test_senior_requires_region_ville(self):
        payload = self.senior_payload()
        payload.pop("region_ville")
        response = self.client.post("/api/candidatures/", payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("region_ville", response.data)

    def test_invalid_region_ville_rejected(self):
        payload = self.senior_payload()
        payload["region_ville"] = "InvalidRegion123"
        response = self.client.post("/api/candidatures/", payload, format="multipart")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("region_ville", response.data)

    def test_valid_region_ville_choices_accepted(self):
        for reg in ["Niamey", "Zinder", "Diaspora / Autre"]:
            with self.subTest(region=reg):
                payload = self.senior_payload()
                payload["region_ville"] = reg
                response = self.client.post("/api/candidatures/", payload, format="multipart")
                self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
                self.assertEqual(response.data["region_ville"], reg)

    def test_admin_can_create_talent_with_status_score_and_note(self):
        payload = self.senior_payload()
        payload["statut"] = "admis"
        payload["score_evaluation"] = 92
        payload["note_interne"] = "Candidat sélectionné directement par le jury"

        response = self.client.post(
            "/api/candidatures/",
            payload,
            format="multipart",
            HTTP_X_ADMIN_ACTION="true",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["statut"], "admis")
        self.assertEqual(response.data["score_evaluation"], 92)
        self.assertEqual(response.data["note_interne"], "Candidat sélectionné directement par le jury")

    def test_admin_can_create_junior_without_file(self):
        payload = {
            "categorie": "junior",
            "maison": "steam",
            "nom": "JuniorAdmin",
            "prenom": "Talent",
            "classe": "3e",
            "region_ville": "Agadez",
            "telephone_tuteur": "+227 90 00 00 00",
            "nom_tuteur": "Tuteur Admin",
            "mascotte_nom": "MascotteAdmin",
            "statut": "admis",
        }
        response = self.client.post(
            "/api/candidatures/",
            payload,
            format="multipart",
            HTTP_X_ADMIN_ACTION="true",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertEqual(response.data["statut"], "admis")
        self.assertEqual(response.data["nom"], "JuniorAdmin")


