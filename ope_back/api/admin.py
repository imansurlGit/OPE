from django.contrib import admin
from .models import (
    Candidature,
    Talent,
    Actualite,
    MembreEquipe,
    Partenaire,
    MediaGalerie,
    MessageContact,
)


admin.site.register(Candidature)

admin.site.register(Talent)

admin.site.register(Actualite)

admin.site.register(MembreEquipe)

admin.site.register(Partenaire)

admin.site.register(MediaGalerie)

admin.site.register(MessageContact)