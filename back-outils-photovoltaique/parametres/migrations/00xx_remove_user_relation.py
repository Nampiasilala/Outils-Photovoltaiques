# apps/parametres/migrations/00xx_remove_user_relation.py
from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('parametres', '0002_alter_parametresysteme_user_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='parametresysteme',
            name='user',
        ),
        # Supprime aussi l'index Meta sur 'user' si présent autrefois
        # (Si un Index explicite existait: migrations.RemoveIndex(...))
    ]
