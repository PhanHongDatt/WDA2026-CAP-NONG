import json
import base64
import urllib.request
import os

print("Sending request to generate image...")
req = urllib.request.Request(
    'http://127.0.0.1:8000/ai/poster-image',
    data=b'{"price_display": "65.000d/kg", "product_name": "Xoai Cat Hoa Loc", "shop_name": "Vuon Tran Nong"}',
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        if data.get('image_base64'):
            img_data = base64.b64decode(data['image_base64'])
            # Save to conversation artifacts directory
            save_path = r'C:\Users\Admin\.gemini\antigravity\brain\8cf7debe-0679-4803-9d57-c58ff5b10e26\generated_poster.png'
            with open(save_path, 'wb') as f:
                f.write(img_data)
            print(f"Saved successfully to {save_path}")
        else:
            print("No image_base64 in response:", data)
except Exception as e:
    print("Error:", e)
