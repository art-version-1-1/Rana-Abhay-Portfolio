import fitz
from pathlib import Path

pdf = Path('attached_assets/Resume_—_Rana_Abhay_Kumar_1789580307444.pdf')
out = Path('.agents/outputs/resume_pages')
out.mkdir(parents=True, exist_ok=True)
doc = fitz.open(pdf)
print(f'pages={doc.page_count}')
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
    path = out / f'page-{i+1}.png'
    pix.save(path)
    print(f'rendered={path}')
    print(f'--- page {i+1} text ---')
    print(page.get_text())
