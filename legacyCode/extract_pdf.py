import sys
import os

try:
    import pypdf
except ImportError:
    os.system('pip install pypdf -q')
    import pypdf

pdf_path = sys.argv[1]
output_path = sys.argv[2]

reader = pypdf.PdfReader(pdf_path)
text = ""
for page in reader.pages:
    text += page.extract_text() + "\n"

with open(output_path, "w", encoding="utf-8") as f:
    f.write(text)

print(f"Extracted {len(text)} characters to {output_path}")
