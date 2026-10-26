import csv
from django.contrib import admin
from django.http import HttpResponse
from django.utils.html import format_html
from .models import (
    Candidature,
    CandidatMascotte,
    Actualite,
    MembreEquipe,
    Partenaire,
    MediaGalerie,
    MessageContact,
    Document,
)

@admin.action(description="Exporter les candidatures sélectionnées en CSV")
def export_candidats_mascotte_csv(modeladmin, request, queryset):
    response = HttpResponse(content_type="text/csv; charset=utf-8-sig")
    response["Content-Disposition"] = 'attachment; filename="candidats_mascotte.csv"'
    
    writer = csv.writer(response, delimiter=";")
    writer.writerow([
        "Référence",
        "Nom",
        "Prénom",
        "Classe",
        "Établissement",
        "Région / Ville",
        "Parent / Tuteur",
        "Téléphone Tuteur",
        "Nom de la Mascotte",
        "Pourquoi ce nom",
        "Signification",
        "Statut",
        "Date d'inscription",
    ])
    
    for obj in queryset:
        writer.writerow([
            obj.reference,
            obj.nom,
            obj.prenom,
            obj.classe,
            obj.etablissement,
            obj.region_ville,
            obj.nom_tuteur,
            obj.telephone_tuteur,
            obj.mascotte_nom,
            obj.mascotte_pourquoi,
            obj.mascotte_signification,
            obj.get_statut_display(),
            obj.created_at.strftime("%d/%m/%Y %H:%M") if obj.created_at else "",
        ])
    return response

@admin.register(CandidatMascotte)
class CandidatMascotteAdmin(admin.ModelAdmin):
    list_display = (
        "reference",
        "nom",
        "prenom",
        "classe",
        "region_ville",
        "mascotte_nom",
        "statut",
        "dessin_preview",
        "created_at",
    )
    list_filter = ("classe", "statut", "region_ville", "created_at")
    search_fields = ("nom", "prenom", "reference", "mascotte_nom", "nom_tuteur", "telephone_tuteur")
    actions = [export_candidats_mascotte_csv]
    readonly_fields = ("reference", "dessin_preview_detail", "created_at", "updated_at")

    fieldsets = (
        ("Identification du Candidat", {
            "fields": ("reference", "nom", "prenom", "classe", "etablissement", "region_ville")
        }),
        ("Représentant Légal & Consentements", {
            "fields": ("nom_tuteur", "telephone_tuteur", "autorisation_parent", "accord_utilisation_dessin")
        }),
        ("Détails de la Mascotte", {
            "fields": ("mascotte_nom", "mascotte_pourquoi", "mascotte_signification", "mascotte_dessin", "dessin_preview_detail")
        }),
        ("Statut & Traitement", {
            "fields": ("statut", "created_at", "updated_at")
        }),
    )

    def dessin_preview(self, obj):
        if obj.mascotte_dessin:
            url = obj.mascotte_dessin.url
            if url.lower().endswith(".pdf"):
                return format_html('<a href="{}" target="_blank" style="color: #F15B29; font-weight: bold;">📄 Voir PDF</a>', url)
            return format_html('<a href="{}" target="_blank"><img src="{}" style="max-height: 40px; max-width: 60px; object-fit: cover; border-radius: 4px;" /></a>', url, url)
        return "—"
    dessin_preview.short_description = "Aperçu dessin"

    def dessin_preview_detail(self, obj):
        if obj.mascotte_dessin:
            url = obj.mascotte_dessin.url
            if url.lower().endswith(".pdf"):
                return format_html('<a href="{}" target="_blank" style="display:inline-block; padding:8px 14px; background:#193549; color:#fff; border-radius:6px; text-decoration:none;">📄 Ouvrir le document PDF</a>', url)
            return format_html('<a href="{}" target="_blank"><img src="{}" style="max-height: 250px; border-radius: 8px; border: 1px solid #ddd;" /></a>', url, url)
        return "Aucun dessin fourni"
    dessin_preview_detail.short_description = "Aperçu grand format"

admin.site.register(Candidature)
admin.site.register(Actualite)
admin.site.register(MembreEquipe)
admin.site.register(Partenaire)
admin.site.register(MediaGalerie)
admin.site.register(MessageContact)
admin.site.register(Document)