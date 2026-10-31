import os
import base64
import tempfile
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv

env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=env_path)
load_dotenv()

CLOUDINARY_CLOUD_NAME = os.getenv("CLOUDINARY_CLOUD_NAME")
CLOUDINARY_API_KEY = os.getenv("CLOUDINARY_API_KEY")
CLOUDINARY_API_SECRET = os.getenv("CLOUDINARY_API_SECRET")

is_cloudinary_configured = bool(
    CLOUDINARY_API_KEY 
    and CLOUDINARY_API_KEY != "your_cloudinary_api_key"
    and CLOUDINARY_API_SECRET 
    and CLOUDINARY_API_SECRET != "your_cloudinary_api_secret"
)

if is_cloudinary_configured:
    try:
        import cloudinary
        import cloudinary.uploader
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET
        )
        print("[Cloudinary] Configured successfully for image hosting.")
    except Exception as e:
        print(f"[Cloudinary] Initialization error: {e}")
        is_cloudinary_configured = False


def upload_to_cloudinary(
    image_bytes: Optional[bytes] = None,
    image_b64: Optional[str] = None,
    file_suffix: str = ".jpg"
) -> Optional[str]:
    """
    Uploads an image to Cloudinary and returns the permanent secure_url.
    Falls back gracefully to data URL if Cloudinary is not configured or fails.
    """
    if not image_bytes and not image_b64:
        return None

    if is_cloudinary_configured:
        try:
            import cloudinary.uploader
            
            # If we have raw bytes, write to a temporary file for upload
            if image_bytes:
                with tempfile.NamedTemporaryFile(delete=False, suffix=file_suffix) as tmp:
                    tmp.write(image_bytes)
                    tmp_path = tmp.name
                upload_res = cloudinary.uploader.upload(tmp_path)
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass
                print(f"[Cloudinary] Upload success: {upload_res.get('secure_url')}")
                return upload_res.get("secure_url")
            elif image_b64:
                # Cloudinary can accept data URI directly
                upload_res = cloudinary.uploader.upload(image_b64)
                print(f"[Cloudinary] Upload success: {upload_res.get('secure_url')}")
                return upload_res.get("secure_url")
        except Exception as e:
            print(f"[Cloudinary] Upload failed ({e}). Falling back to data URL.")

    # Fallback to standard base64 data URI
    if image_bytes:
        encoded = base64.b64encode(image_bytes).decode('utf-8')
        return f"data:image/jpeg;base64,{encoded}"
    return image_b64
