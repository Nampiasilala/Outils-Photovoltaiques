# contenus/models.py - ✅ Pour référence
from django.db import models

class HelpContent(models.Model):
    key = models.SlugField(max_length=64, unique=True)  # ex: e_jour, p_max…
    title = models.CharField(max_length=200)
    body_html = models.TextField(blank=True)  # HTML venant de Tiptap
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["key"]

    def __str__(self):
        return self.key