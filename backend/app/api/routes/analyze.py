from fastapi import APIRouter, UploadFile, File, Request, HTTPException
from PIL import Image
import io
import json
import logging
from app.ai.llm.factory import get_llm_service
from app.utils.limiter import limiter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/analyze", tags=["Image Analysis"])

@router.post(
    "/analyze-image",
    summary="Analyze Screenshot for Errors",
    description="Takes an uploaded screenshot, runs it through Gemini Vision LLM, and extracts structured error details, explanation, and solution.",
)
@limiter.limit("10/minute")
async def analyze_image_endpoint(
    request: Request,
    image: UploadFile = File(...),
):
    # Verify file is an image
    if not image.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image.")
    
    try:
        # Read image content
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents))
    except Exception as e:
        logger.error(f"Failed to parse uploaded image: {e}")
        raise HTTPException(status_code=400, detail="Invalid image file format.")
    
    prompt = """
You are an expert software engineer, UI designer, and systems debugger.
Analyze this screenshot. It might contain a coding compilation error, a UI/UX bug, a database trace, a government website error message, or a general system failure.

Provide a JSON response with precisely the following three fields. Do not include any markdown format blocks or extra text around the JSON. Return only a valid JSON string.

{
  "error": "<A concise title or summary of the error/issue detected>",
  "explanation": "<A detailed explanation of why this error happens and what is causing it in the screenshot>",
  "solution": "<Step-by-step actionable guide or instructions to fix this error permanently>"
}
"""

    try:
        # Get active LLM provider (we want Gemini)
        llm = get_llm_service("gemini")
        
        # If client is ready, we do multimodal call
        if getattr(llm, "_client_ready", False):
            # We call the model directly to leverage multimodal inputs
            response = llm._model.generate_content([prompt, pil_image])
            raw_text = getattr(response, "text", "") or ""
        else:
            # Fallback mock response
            raw_text = json.dumps({
                "error": "Database Connection Timeout (Mocked)",
                "explanation": "The screenshot shows an application trying to connect to a PostgreSQL database at localhost:5432, which failed because the database server is not running or blocked by firewall rules.",
                "solution": "1. Verify if PostgreSQL service is running using 'pg_ctl status' or service manager.\n2. Start the service using 'sudo service postgresql start'.\n3. Check your database credentials in your .env file."
            })
        
        # Parse the JSON response
        # Sometimes the model returns markdown formatting blocks like ```json ... ```, so clean it
        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]
        cleaned_text = cleaned_text.strip()
        
        try:
            result = json.loads(cleaned_text)
        except Exception:
            # If JSON parsing fails, fall back to structuring the raw text
            result = {
                "error": "Error Detected in Screenshot",
                "explanation": raw_text,
                "solution": "Review the details above and check system logs for more information."
            }
            
        return result
        
    except Exception as e:
        logger.error(f"Error during image analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")
