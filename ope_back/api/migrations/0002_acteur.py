from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Acteur',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titre', models.CharField(max_length=150, verbose_name='Titre / Fonction')),
                ('sous_titre', models.CharField(default="Organisation pour la Promotion de l'Excellence (OPE)", max_length=200, verbose_name='Sous-titre / Organisation')),
                ('nom', models.CharField(max_length=150, verbose_name='Nom complet')),
                ('photo', models.ImageField(blank=True, null=True, upload_to='acteurs/', verbose_name='Photo')),
                ('couleur', models.CharField(default='#111111', max_length=20, verbose_name='Couleur principale (hex)')),
                ('couleur_light', models.CharField(default='#F5F5F5', max_length=20, verbose_name='Couleur de fond claire (hex)')),
                ('exergue', models.CharField(max_length=300, verbose_name='Citation / Phrase exergue')),
                ('mot', models.TextField(verbose_name='Message / Biographie (paragraphes séparés par une ligne vide)')),
                ('ordre', models.PositiveIntegerField(default=0, verbose_name="Ordre d'affichage")),
                ('actif', models.BooleanField(default=True, verbose_name='Afficher sur le site')),
            ],
            options={
                'verbose_name': 'Acteur',
                'verbose_name_plural': 'Acteurs',
                'ordering': ['ordre', 'nom'],
            },
        ),
    ]

