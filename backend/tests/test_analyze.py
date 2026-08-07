import io
import pytest
from fastapi.testclient import TestClient
from PIL import Image
from app.main import app

client = TestClient(app)

def test_analyze_image():
    # 1. Create a dummy PNG image in memory
    img = Image.new("RGB", (100, 100), color="red")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="PNG")
    img_byte_arr.seek(0)
    
    # 2. Call the screenshot analysis endpoint
    response = client.post(
        "/api/v1/analyze/analyze-image",
        files={"image": ("test_screenshot.png", img_byte_arr, "image/png")}
    )
    
    # 3. Assert correct response code and payload fields
    assert response.status_code == 200
    data = response.json()
    assert "error" in data
    assert "explanation" in data
    assert "solution" in data
