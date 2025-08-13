# apps/parametres/admin.py
from django.contrib import admin
from .models import ParametreSysteme

@admin.register(ParametreSysteme)
class ParametreSystemeAdmin(admin.ModelAdmin):
    list_display  = ('id', 'n_global', 'k_securite', 'dod', 'k_dimensionnement', 's_max', 'i_sec', 'updated_at')
    readonly_fields = ('updated_at',)

    def has_add_permission(self, request):
        # Empêche l'ajout si un enregistrement existe déjà
        if ParametreSysteme.objects.exists():
            return False
        return super().has_add_permission(request)
