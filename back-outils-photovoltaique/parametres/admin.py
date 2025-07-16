from django.contrib import admin
from .models import ParametreSysteme

@admin.register(ParametreSysteme)
class ParametreSystemeAdmin(admin.ModelAdmin):
    list_display  = ('user', 'n_global', 'k_securite', 'dod', 'k_dimensionnement', 'h_solaire')
    list_filter   = ('user',)
    search_fields = ('user__email',)
