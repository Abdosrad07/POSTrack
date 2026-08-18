from app.crud.base import CRUDBase
from app.models.requete import Requete, RequeteEntite, RequeteCommentaire

requete_crud = CRUDBase(Requete)
requete_entite_crud = CRUDBase(RequeteEntite)
requete_commentaire_crud = CRUDBase(RequeteCommentaire)
