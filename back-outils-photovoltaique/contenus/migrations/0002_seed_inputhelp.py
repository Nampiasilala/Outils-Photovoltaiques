# contenus/migrations/0002_seed_inputhelp.py
from django.db import migrations

def seed(apps, schema_editor):
    InputHelp = apps.get_model('contenus', 'InputHelp')
    defaults = [
        dict(key='daily_consumption', title='Consommation journalière (Wh)', unit='Wh', placeholder='ex: 3500', order=1,
             help_html="<p>Saisissez la somme quotidienne des consommations en Wh (ex: 3 500 Wh).</p>"),
        dict(key='peak_power', title='Puissance max (W)', unit='W', placeholder='ex: 1200', order=2,
             help_html="<p>Pic de puissance simultané (W) quand le plus d’appareils tournent.</p>"),
        dict(key='autonomy_days', title="Jours d'autonomie", unit='jours', placeholder='ex: 2', order=3,
             help_html="<p>Nombre de jours sans soleil pendant lesquels le système doit tenir.</p>"),
        dict(key='battery_voltage', title='Tension batterie', unit='V', placeholder='12 / 24 / 48', order=4,
             help_html="<p>Tension nominale de la banque de batteries (12V, 24V ou 48V).</p>"),
        dict(key='location', title='Localisation', unit='', placeholder='Antananarivo, MG', order=5,
             help_html="<p>Ville/pays du système. Sert à charger l’irradiation locale.</p>"),
        dict(key='irradiance', title='Irradiation (kWh/m²/j)', unit='kWh/m²/j', placeholder='ex: 5.2', order=6,
             help_html="<p>Irradiation solaire moyenne quotidienne. Utilisée pour dimensionner le champ PV.</p>"),
    ]
    for d in defaults:
        InputHelp.objects.get_or_create(key=d['key'], defaults=d)

def unseed(apps, schema_editor):
    InputHelp = apps.get_model('contenus', 'InputHelp')
    InputHelp.objects.all().delete()

class Migration(migrations.Migration):
    dependencies = [
        ('contenus', '0001_initial'),
    ]
    operations = [
        migrations.RunPython(seed, unseed)
    ]
