from decimal import Decimal
from pydantic import BaseModel


class POSExpirationAlert(BaseModel):
    pos_id: int
    code_pos: str
    name: str
    date_expiration: str
    jours_restants: int


class DashboardOut(BaseModel):
    partner_id: int
    partner_name: str
    pos_total: int
    pos_nouveau: int
    pos_reconduit: int
    primes_en_attente: int
    primes_validees: int
    montant_primes_periode: Decimal
    requetes_ouvertes: int
    bts_saturees: int
    sim_en_stock: int
    sim_assignees: int
    pos_expirations_proches: list[POSExpirationAlert] = []
