from django.db.models import Q, Count
from django.db.models.functions import TruncDate, TruncWeek, TruncMonth
from django.utils import timezone
from datetime import datetime, timedelta, timezone as dt_tz
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from . import models, serializers as sz

class CandidatureViewSet(viewsets.ModelViewSet):
    serializer_class = sz.CandidatureSerializer

    def get_queryset(self):
        qs = models.Candidature.objects.all().order_by("-created_at")
        categorie = self.request.query_params.get("categorie")
        maison = self.request.query_params.get("maison")
        domaine_steam = self.request.query_params.get("domaine_steam") or self.request.query_params.get("domaine") or self.request.query_params.get("classe")
        statut = self.request.query_params.get("statut")
        region = self.request.query_params.get("region")
        search = self.request.query_params.get("search")

        if categorie and categorie != "all":
            qs = qs.filter(categorie=categorie)
        if maison and maison != "all":
            qs = qs.filter(maison=maison)
        if domaine_steam and domaine_steam != "all":
            qs = qs.filter(domaine_steam=domaine_steam)
        if statut and statut != "all":
            qs = qs.filter(statut=statut)
        if region and region != "all":
            qs = qs.filter(region_ville__icontains=region)
        if search:
            search_clean = search.strip()
            qs = qs.filter(
                Q(nom__icontains=search_clean) |
                Q(prenom__icontains=search_clean) |
                Q(reference__icontains=search_clean) |
                Q(email__icontains=search_clean) |
                Q(region_ville__icontains=search_clean) |
                Q(innovation_nom__icontains=search_clean) |
                Q(mascotte_nom__icontains=search_clean)
            )
        return qs

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'create', 'card', 'stats', 'partial_update', 'update', 'destroy']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [perm() for perm in permission_classes]

    def create(self, request, *args, **kwargs):
        data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)

        is_admin_action = (
            (request.user and request.user.is_authenticated) or
            request.headers.get("X-Admin-Action") == "true"
        )

        # Interdire au client public ordinaire de forcer statut, score ou note_interne
        if not is_admin_action:
            data.pop("statut", None)
            data.pop("score_evaluation", None)
            data.pop("note_interne", None)
        else:
            # Pour l'administration, valider par défaut les consentements s'ils ne sont pas spécifiés
            if "disponible_camps" not in data:
                data["disponible_camps"] = True
            if "accepte_conditions" not in data:
                data["accepte_conditions"] = True
            if "autorisation_parent" not in data:
                data["autorisation_parent"] = True
            if "accord_utilisation_dessin" not in data:
                data["accord_utilisation_dessin"] = True

        # Ignorer age et date_naissance pour rétrocompatibilité
        data.pop("age", None)
        data.pop("date_naissance", None)

        # Conversion des booleans venant de multipart/form-data
        bool_fields = [
            "autorisation_parent",
            "accord_utilisation_dessin",
            "participe_defile",
            "facilitateur_juniors",
            "souhaite_stand",
            "concours_prix_innovation",
            "disponible_camps",
            "accepte_conditions",
        ]
        for bool_field in bool_fields:
            if bool_field in data:
                val = data[bool_field]
                if isinstance(val, str):
                    data[bool_field] = val.lower() in ("true", "1", "yes")

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        candidature = serializer.save()

        response_serializer = self.get_serializer(candidature)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='card/(?P<reference>[^/.]+)')
    def card(self, request, reference=None):
        try:
            candidature = models.Candidature.objects.get(reference=reference)
            serializer = self.get_serializer(candidature)
            return Response(serializer.data)
        except models.Candidature.DoesNotExist:
            return Response({"detail": "Candidature non trouvée."}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        qs = models.Candidature.objects.all()
        total = qs.count()

        # ── KPIs ──
        admis = qs.filter(statut="admis").count()
        preselectionnes = qs.filter(statut="preselectionne").count()
        en_revue = qs.filter(statut="en_revue").count()
        soumis = qs.filter(statut="soumis").count()
        rejetes = qs.filter(statut="rejete").count()

        femmes = qs.filter(sexe="F").count()
        hommes = qs.filter(sexe="M").count()
        pct_f = round((femmes / total * 100), 1) if total else 0
        pct_m = round((hommes / total * 100), 1) if total else 0

        # ── Répartition par catégorie / domaine ──
        senior = qs.filter(categorie="senior").count()
        junior = qs.filter(categorie="junior").count()

        # ── Répartition par région ──
        regions_qs = (
            qs.values("region_ville")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        regions = [
            {
                "region": r["region_ville"] or "Non spécifiée",
                "count": r["count"],
                "percentage": round(r["count"] / total * 100) if total else 0,
            }
            for r in regions_qs
        ]
        max_region = regions[0]["count"] if regions else 1

        now = timezone.now()

        # ── Évolution sur les 30 derniers jours ──
        since = now - timedelta(days=29)
        daily_qs = (
            qs.filter(created_at__gte=since)
            .annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        base_before = qs.filter(created_at__lt=since).count()
        daily_map = {str(d["day"]): d["count"] for d in daily_qs}

        timeline_30d = []
        cumul = base_before
        for i in range(30):
            day = (since + timedelta(days=i)).date()
            day_str = str(day)
            count = daily_map.get(day_str, 0)
            cumul += count
            timeline_30d.append({
                "label": day.strftime("%d/%m"),
                "value": cumul,
                "new": count,
                "period_info": day.strftime("%d/%m/%Y"),
            })

        # ── Évolution par semaine (8 dernières semaines) ──
        cur_week_start = (now - timedelta(days=now.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        start_week = cur_week_start - timedelta(weeks=7)
        weeks_qs = (
            qs.filter(created_at__gte=start_week)
            .annotate(w=TruncWeek("created_at"))
            .values("w")
            .annotate(count=Count("id"))
            .order_by("w")
        )
        weeks_map = {w["w"].date(): w["count"] for w in weeks_qs}
        base_before_w = qs.filter(created_at__lt=start_week).count()
        cumul_w = base_before_w
        timeline_week = []
        for i in range(8):
            w_start = (start_week + timedelta(weeks=i)).date()
            w_end = w_start + timedelta(days=6)
            count = weeks_map.get(w_start, 0)
            cumul_w += count
            week_num = w_start.isocalendar()[1]
            timeline_week.append({
                "label": f"S{week_num}",
                "value": cumul_w,
                "new": count,
                "period_info": f"Semaine {week_num} ({w_start.strftime('%d/%m')} - {w_end.strftime('%d/%m')})",
            })

        # ── Évolution par mois (6 derniers mois) ──
        MOIS_FR = [
            "Janv", "Févr", "Mars", "Avr", "Mai", "Juin",
            "Juil", "Août", "Sept", "Oct", "Nov", "Déc"
        ]
        cur_m_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_starts = []
        for step in range(5, -1, -1):
            year = cur_m_start.year
            month = cur_m_start.month - step
            while month <= 0:
                month += 12
                year -= 1
            month_starts.append(datetime(year, month, 1, tzinfo=dt_tz.utc))

        first_m_start = month_starts[0]
        months_qs = (
            qs.filter(created_at__gte=first_m_start)
            .annotate(m=TruncMonth("created_at"))
            .values("m")
            .annotate(count=Count("id"))
            .order_by("m")
        )
        months_map = {m["m"].date(): m["count"] for m in months_qs}
        base_before_m = qs.filter(created_at__lt=first_m_start).count()
        cumul_m = base_before_m
        timeline_month = []
        for m_dt in month_starts:
            d_date = m_dt.date()
            count = months_map.get(d_date, 0)
            cumul_m += count
            m_name = MOIS_FR[d_date.month - 1]
            timeline_month.append({
                "label": m_name,
                "value": cumul_m,
                "new": count,
                "period_info": f"{m_name} {d_date.year}",
            })

        return Response({
            "total": total,
            "statuts": {
                "admis": admis,
                "preselectionne": preselectionnes,
                "en_revue": en_revue,
                "soumis": soumis,
                "rejete": rejetes,
            },
            "parite": {
                "femmes": femmes,
                "hommes": hommes,
                "pct_f": pct_f,
                "pct_m": pct_m,
            },
            "domaines": {
                "STEAM": qs.filter(maison="steam").count(),
                "LP": qs.filter(maison="local_project").count(),
                "MCC": qs.filter(maison="mouvement_citoyen").count(),
                "junior": junior,
                "senior": senior,
            },
            "categories": {
                "junior": junior,
                "senior": senior,
            },
            "regions": regions,
            "max_region_count": max_region,
            "timeline_30d": timeline_30d,
            "timeline_week": timeline_week,
            "timeline_month": timeline_month,
            "regions_couvertes": len(regions),
        })

class ActualiteViewSet(viewsets.ModelViewSet):
    serializer_class = sz.ActualiteSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = models.Actualite.objects.all().order_by("-date_publication", "-created_at")
        phase = self.request.query_params.get("phase")
        publie = self.request.query_params.get("publie")
        search = self.request.query_params.get("search")

        if phase and phase != "all":
            qs = qs.filter(phase=phase)
        if publie is not None and publie != "all":
            is_publie = publie.lower() in ["true", "1", "yes"]
            qs = qs.filter(publie=is_publie)
        if search:
            s = search.strip()
            qs = qs.filter(
                Q(titre__icontains=s) |
                Q(resume__icontains=s) |
                Q(contenu__icontains=s) |
                Q(badge_label__icontains=s)
            )
        return qs

class MembreEquipeViewSet(viewsets.ModelViewSet):
    serializer_class = sz.MembreEquipeSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = models.MembreEquipe.objects.all().order_by("ordre", "nom")
        section = self.request.query_params.get("section")
        actif = self.request.query_params.get("actif")
        search = self.request.query_params.get("search")

        if section and section != "all":
            qs = qs.filter(section=section)
        if actif is not None and actif != "all":
            is_actif = actif.lower() in ["true", "1", "yes"]
            qs = qs.filter(actif=is_actif)
        if search:
            s = search.strip()
            qs = qs.filter(
                Q(nom__icontains=s) |
                Q(role__icontains=s) |
                Q(description__icontains=s)
            )
        return qs

class MessageContactViewSet(viewsets.ModelViewSet):
    serializer_class = sz.MessageContactSerializer
    permission_classes = [permissions.AllowAny]
    queryset = models.MessageContact.objects.all().order_by("-created_at")

class MediaGalerieViewSet(viewsets.ModelViewSet):
    serializer_class = sz.MediaGalerieSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = models.MediaGalerie.objects.all().order_by("ordre", "-created_at")
        categorie = self.request.query_params.get("categorie")
        mis_en_avant = self.request.query_params.get("mis_en_avant")
        search = self.request.query_params.get("search")

        if categorie and categorie != "all":
            qs = qs.filter(categorie=categorie)
        if mis_en_avant is not None and mis_en_avant != "all":
            is_mea = mis_en_avant.lower() in ["true", "1", "yes"]
            qs = qs.filter(mis_en_avant=is_mea)
        if search:
            s = search.strip()
            qs = qs.filter(Q(titre__icontains=s))
        return qs


class PartenaireViewSet(viewsets.ModelViewSet):
    serializer_class = sz.PartenaireSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = models.Partenaire.objects.all().order_by("nom")
        type_param = self.request.query_params.get("type")
        categorie_param = self.request.query_params.get("categorie")
        search = self.request.query_params.get("search")

        if type_param and type_param != "all":
            qs = qs.filter(type=type_param)
        if categorie_param and categorie_param != "all":
            qs = qs.filter(categorie=categorie_param)
        if search:
            qs = qs.filter(Q(nom__icontains=search.strip()))
        return qs


class ActeurViewSet(viewsets.ModelViewSet):
    serializer_class = sz.ActeurSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = models.Acteur.objects.all().order_by("ordre", "nom")
        actif = self.request.query_params.get("actif")
        search = self.request.query_params.get("search")

        if actif is not None and actif != "all":
            is_actif = actif.lower() in ["true", "1", "yes"]
            qs = qs.filter(actif=is_actif)
        if search:
            s = search.strip()
            qs = qs.filter(
                Q(nom__icontains=s) |
                Q(titre__icontains=s) |
                Q(exergue__icontains=s)
            )
        return qs


class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = sz.DocumentSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = models.Document.objects.all().order_by("-annee", "-created_at")
        type_param = self.request.query_params.get("type")
        annee = self.request.query_params.get("annee")
        search = self.request.query_params.get("search")

        if type_param and type_param != "all":
            qs = qs.filter(type=type_param)
        if annee and annee != "all":
            qs = qs.filter(annee=annee)
        if search:
            qs = qs.filter(Q(titre__icontains=search.strip()))
        return qs


from rest_framework.throttling import AnonRateThrottle

class MascotteSubmissionRateThrottle(AnonRateThrottle):
    rate = "10/minute"

class CandidatMascotteViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour la gestion des candidatures au Concours de la Mascotte :
    - POST /api/mascotte/candidatures/ : Public, soumission de candidature avec limitation de débit et protection anti-spam.
    - GET, PUT, PATCH, DELETE : Réservé aux administrateurs authentifiés.
    """
    serializer_class = sz.CandidatMascotteSerializer

    def get_permissions(self):
        if self.action == "create":
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_throttles(self):
        if self.action == "create":
            return [MascotteSubmissionRateThrottle()]
        return super().get_throttles()

    def get_queryset(self):
        qs = models.CandidatMascotte.objects.all().order_by("-created_at")
        classe = self.request.query_params.get("classe")
        statut = self.request.query_params.get("statut")
        region = self.request.query_params.get("region") or self.request.query_params.get("region_ville")
        search = self.request.query_params.get("search")

        if classe and classe != "all":
            qs = qs.filter(classe=classe)
        if statut and statut != "all":
            qs = qs.filter(statut=statut)
        if region and region != "all":
            qs = qs.filter(region_ville__icontains=region)
        if search:
            s = search.strip()
            qs = qs.filter(
                Q(nom__icontains=s) |
                Q(prenom__icontains=s) |
                Q(reference__icontains=s) |
                Q(mascotte_nom__icontains=s) |
                Q(nom_tuteur__icontains=s) |
                Q(telephone_tuteur__icontains=s)
            )
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        candidat = serializer.save()

        # Réponse publique ne révélant aucune donnée personnelle de mineur
        public_data = sz.CandidatMascottePublicSerializer(candidat).data
        headers = self.get_success_headers(public_data)
        
        return Response(
            {
                "success": True,
                "message": "Félicitations ! Ta candidature au Concours de la Mascotte CNCEIZ Agadez 2026 a été enregistrée avec succès.",
                **public_data,
            },
            status=status.HTTP_201_CREATED,
            headers=headers,
        )

