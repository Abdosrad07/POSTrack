"""
Protection anti-brute-force sur la route de connexion.

Implementation en memoire (process-local), volontairement simple pour
ce projet : suffisante pour un deploiement mono-instance (le cas de ce
sprint), mais a remplacer par un stockage partage (Redis) si l'API est
un jour deployee en plusieurs instances derriere un load-balancer,
sans quoi chaque instance aurait son propre compteur.

Regle : au-dela de MAX_FAILED_ATTEMPTS echecs consecutifs pour un
meme identifiant (nom d'utilisateur), les tentatives suivantes sont
bloquees pendant LOCKOUT_SECONDS, meme avec le bon mot de passe. Le
verrou est leve automatiquement a l'expiration du delai ou des la
premiere connexion reussie.
"""
import time
import threading

MAX_FAILED_ATTEMPTS = 5
LOCKOUT_SECONDS = 300  # 5 minutes

_lock = threading.Lock()
_failed_attempts: dict[str, int] = {}
_locked_until: dict[str, float] = {}


def is_locked(username: str) -> bool:
    with _lock:
        until = _locked_until.get(username)
        if until is None:
            return False
        if time.time() >= until:
            # Le verrou a expire : on le leve et on repart a zero.
            _locked_until.pop(username, None)
            _failed_attempts.pop(username, None)
            return False
        return True


def seconds_until_unlock(username: str) -> int:
    with _lock:
        until = _locked_until.get(username)
        if until is None:
            return 0
        return max(0, int(until - time.time()))


def register_failed_attempt(username: str) -> None:
    with _lock:
        count = _failed_attempts.get(username, 0) + 1
        _failed_attempts[username] = count
        if count >= MAX_FAILED_ATTEMPTS:
            _locked_until[username] = time.time() + LOCKOUT_SECONDS


def register_success(username: str) -> None:
    with _lock:
        _failed_attempts.pop(username, None)
        _locked_until.pop(username, None)
