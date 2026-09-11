from django.contrib import admin
from .models import (
    Candidature,
    Actualite,
    MembreEquipe,
    Partenaire,
    MediaGalerie,
    MessageContact,
)


admin.site.register(Candidature)

admin.site.register(Actualite)

admin.site.register(MembreEquipe)

admin.site.register(Partenaire)

admin.site.register(MediaGalerie)

admin.site.register(MessageContact)