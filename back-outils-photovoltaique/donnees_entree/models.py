from django.db import models
from users.models import User

class DonneesEntree(models.Model):
    e_jour = models.FloatField()
    p_max = models.FloatField()
    n_autonomie = models.FloatField()
    localisation = models.CharField(max_length=255)
    v_batterie = models.FloatField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
