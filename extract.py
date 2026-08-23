import pypdf

def extract_text(pdf_path, txt_path):
    reader = pypdf.PdfReader(pdf_path)
    text = ""
    for i, page in enumerate(reader.pages):
        text += f"--- PAGE {i+1} ---\n"
        text += page.extract_text() + "\n"
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(text)
    print("Extraction complete!")

if __name__ == "__main__":
    extract_text("/Users/arinarora/Desktop/Unthinkable/assignment.pdf", "/Users/arinarora/Desktop/Unthinkable/assignment_text.txt")
