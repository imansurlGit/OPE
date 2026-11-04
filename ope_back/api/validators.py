import os
from django.core.exceptions import ValidationError

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 Mo

# Le formulaire accepte image/* : tous les formats d'image courants, sauf SVG (peut contenir du JavaScript)
ALLOWED_IMAGE_EXTENSIONS = [
    ".jpg", ".jpeg", ".jpe", ".jfif", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff", ".heic", ".heif", ".avif",
]
ALLOWED_DOC_EXTENSIONS = [".pdf"]
ALLOWED_VIDEO_EXTENSIONS = [
    ".mp4", ".m4v", ".mov", ".webm", ".avi", ".mkv", ".3gp", ".3g2", ".mpg", ".mpeg", ".ogv", ".wmv",
]
ALLOWED_ALL_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS + ALLOWED_DOC_EXTENSIONS

def validate_file_size(file):
    if file.size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            f"Le fichier dépasse la taille maximale autorisée de 10 Mo ({file.size / (1024 * 1024):.1f} Mo détectés)."
        )

def validate_image_extension(file):
    validate_file_size(file)
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise ValidationError(
            f"Format non supporté ({ext}). Formats acceptés : {', '.join(ALLOWED_IMAGE_EXTENSIONS)}."
        )

def validate_doc_or_image_extension(file):
    validate_file_size(file)
    ext = os.path.splitext(file.name)[1].lower()
    if ext not in ALLOWED_ALL_EXTENSIONS:
        raise ValidationError(
            f"Format non supporté ({ext}). Formats acceptés : {', '.join(ALLOWED_ALL_EXTENSIONS)}."
        )

def validate_preuve_realisation(file):
    """Preuves de réalisation : photo, document ou vidéo (le formulaire Senior accepte video/*)."""
    validate_file_size(file)
    ext = os.path.splitext(file.name)[1].lower()
    allowed_exts = ALLOWED_ALL_EXTENSIONS + ALLOWED_VIDEO_EXTENSIONS
    if ext not in allowed_exts:
        raise ValidationError(
            f"Format non supporté ({ext}). Formats acceptés : {', '.join(allowed_exts)}."
        )

def _signature_reconnue(header):
    """Reconnaît une image ou un PDF d'après ses premiers octets."""
    return (
        header.startswith((
            b"\xff\xd8\xff",  # JPEG
            b"\x89PNG\r\n\x1a\n",  # PNG
            b"%PDF-",  # PDF
            b"GIF87a", b"GIF89a",  # GIF
            b"BM",  # BMP
            b"II*\x00", b"MM\x00*",  # TIFF
        ))
        or (header[:4] == b"RIFF" and header[8:12] == b"WEBP")  # WEBP
        or header[4:8] == b"ftyp"  # HEIC, HEIF, AVIF
    )

def _verifier_contenu(file):
    """Vérifie le type réel du fichier via ses octets magiques."""
    pos = 0
    if hasattr(file, "tell"):
        try:
            pos = file.tell()
        except Exception:
            pos = 0

    try:
        if hasattr(file, "seek") and hasattr(file, "read"):
            file.seek(0)
            header = file.read(16)
            file.seek(pos)

            if not _signature_reconnue(header):
                raise ValidationError(
                    "Le fichier envoyé n'est pas une image ou un PDF valide (contenu non reconnu)."
                )
    except ValidationError:
        raise
    except Exception:
        # En cas d'impossibilité de lire le buffer, se fier à l'extension
        pass

def validate_photo_identite(file):
    """Photo d'identité : extension d'image et contenu réel (remplace le contrôle Pillow, qui ne lit pas le HEIC)."""
    validate_image_extension(file)
    _verifier_contenu(file)

def validate_mascotte_dessin(file):
    """
    Valide le dessin de la mascotte :
    - Taille maximale de 10 Mo
    - Extensions autorisées : images et PDF
    - Vérification du type réel du fichier via ses octets magiques
    """
    validate_file_size(file)

    name = getattr(file, "name", "")
    ext = os.path.splitext(name)[1].lower()
    if ext not in ALLOWED_ALL_EXTENSIONS:
        raise ValidationError(
            f"Format de fichier non autorisé ({ext}). Les formats autorisés sont : images et PDF."
        )

    _verifier_contenu(file)

def validate_telephone_tuteur(value):
    """
    Valide le numéro de téléphone du tuteur.
    """
    if not value or not str(value).strip():
        raise ValidationError("Le numéro de téléphone du tuteur est obligatoire.")
    cleaned = str(value).strip().replace(" ", "").replace("-", "").replace(".", "")
    if len(cleaned) < 8 or len(cleaned) > 20:
        raise ValidationError("Le numéro de téléphone doit contenir entre 8 et 20 caractères.")

