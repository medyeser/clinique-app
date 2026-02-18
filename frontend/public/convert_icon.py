from PIL import Image
import os

source = r"c:\Users\21655\Desktop\python\frontend\public\icon.ico"
target = r"c:\Users\21655\Desktop\python\frontend\public\icon_fixed.ico"

try:
    # Open the file (even if named .ico, PIL detects if it's PNG)
    img = Image.open(source)
    
    # Save as real ICO
    # Including sizes for better quality info
    img.save(target, format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
    print("Conversion successful")
except Exception as e:
    print(f"Error: {e}")
