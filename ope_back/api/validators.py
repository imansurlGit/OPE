import os
from django.core.exceptions import ValidationError

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 Mo

ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"]
ALLOWED_DOC_EXTENSIONS = [".pdf"]
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

def validate_mascotte_dessin(file):
    """
    Valide le dessin de la mascotte :
    - Taille maximale de 10 Mo
    - Extensions autorisées : .jpg, .jpeg, .png, .pdf
    - Vérification du type réel du fichier via ses octets magiques
    """
    validate_file_size(file)
    
    name = getattr(file, "name", "")
    ext = os.path.splitext(name)[1].lower()
    allowed_exts = [".jpg", ".jpeg", ".png", ".pdf"]
    if ext not in allowed_exts:
        raise ValidationError(
            f"Format de fichier non autorisé ({ext}). Les formats autorisés sont : JPG, JPEG, PNG, PDF."
        )

    # Vérification des octets magiques réels
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

            is_valid_type = False
            # JPEG: FF D8 FF
            if header.startswith(b"\xff\xd8\xff"):
                is_valid_type = True
            # PNG: 89 50 4E 47 0D 0A 1A 0A
            elif header.startswith(b"\x89PNG\r\n\x1a\n"):
                is_valid_type = True
            # PDF: %PDF-
            elif header.startswith(b"%PDF-"):
                is_valid_type = True

            if not is_valid_type:
                raise ValidationError(
                    "Le fichier envoyé n'est pas un fichier image (JPG, PNG) ou PDF valide (contenu non reconnu)."
                )
    except ValidationError:
        raise
    except Exception:
        # En cas d'impossibilité de lire le buffer, se fier à l'extension
        pass

def validate_telephone_tuteur(value):
    """
    Valide le numéro de téléphone du tuteur.
    """
    if not value or not str(value).strip():
        raise ValidationError("Le numéro de téléphone du tuteur est obligatoire.")
    cleaned = str(value).strip().replace(" ", "").replace("-", "").replace(".", "")
    if len(cleaned) < 8 or len(cleaned) > 20:
        raise ValidationError("Le numéro de téléphone doit contenir entre 8 et 20 caractères.")

