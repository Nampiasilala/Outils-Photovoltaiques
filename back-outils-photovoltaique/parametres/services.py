# apps/parametres/services.py
from types import SimpleNamespace
from .models import ParametreSysteme

DEFAULTS = dict(
    n_global=0.75,
    k_securite=1.30,
    dod=0.50,
    k_dimensionnement=1.25,
    s_max=0.25,
    i_sec=1.25,
)

def get_or_create_global_params() -> ParametreSysteme:
    """
    Retourne l'unique ParametreSysteme.
    - S'il n'existe pas, le crée avec DEFAULTS.
    - S'il y en a plusieurs (héritage ancien), retourne le plus récent.
    """
    qs = ParametreSysteme.objects.all().order_by("-updated_at", "-id")
    obj = qs.first()
    if obj:
        return obj
    # Pas d'objet : on le crée avec les defaults
    return ParametreSysteme.objects.create(**DEFAULTS)

def get_effective_params() -> SimpleNamespace:
    """
    Renvoie un objet 'params effectifs' (SimpleNamespace) prêt à l'emploi
    pour le calcul. Si des champs sont manquants, applique DEFAULTS.
    """
    obj = get_or_create_global_params()
    data = DEFAULTS.copy()
    for k in DEFAULTS.keys():
        v = getattr(obj, k, None)
        if v is not None:
            data[k] = v
    return SimpleNamespace(**data)
