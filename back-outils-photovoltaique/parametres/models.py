from django.db import models
from users.models import User

class ParametreSysteme(models.Model):
    n_global = models.FloatField()
    k_securite = models.FloatField()
    dod = models.FloatField()
    k_dimensionnement = models.FloatField()
    h_solaire = models.FloatField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f"Paramètre {self.id}"
