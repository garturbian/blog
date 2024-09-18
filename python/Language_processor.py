"""
To run this script:
1. Activate virtual environment: .\.venv\Scripts\Activate.ps1
2. Run script: python python/language_processor.py
"""
import re
from langdetect import detect
import pyperclip
import winsound  # Add this import

def detect_language(text):
    if re.search(r'[\u4e00-\u9fff]', text):
        return 'zh-TW'
    return 'en'

def process_line(line):
    if not line.strip():
        return '<br>'
    
    tokens = re.findall(r'[\u4e00-\u9fff]+|[a-zA-Z]+(?:\'[a-z]+)?|\s+|[^\s\u4e00-\u9fffa-zA-Z]+', line)
    processed = []
    current_lang = None

    for token in tokens:
        if token.strip():
            lang = detect_language(token)
            if lang != current_lang and current_lang is not None:
                processed.append('</span>&nbsp;<span lang="{}" class="{}-text">'.format(lang, lang))
            elif current_lang is None:
                processed.append('<span lang="{}" class="{}-text">'.format(lang, lang))
            current_lang = lang
            processed.append(token)
        else:
            processed.append(token)

    if current_lang is not None:
        processed.append('</span>')

    return ''.join(processed)

def process_markdown(content):
    paragraphs = content.split('\n\n')
    processed_paragraphs = []
    for paragraph in paragraphs:
        lines = paragraph.split('\n')
        processed_lines = [process_line(line) for line in lines]
        processed_paragraph = ' '.join(processed_lines)  # Join lines within a paragraph without <br>
        processed_paragraphs.append(processed_paragraph)
    return '<br><br>'.join(processed_paragraphs)  # Join paragraphs with double <br>

if __name__ == "__main__":
    # Read from clipboard
    input_text = pyperclip.paste()

    processed_text = process_markdown(input_text)
    
    # Write to clipboard
    pyperclip.copy(processed_text)
    
    print("Processed text has been copied to clipboard.")
    print("You can now paste it into your desired file.")

    print("Attempting to play beep...")
    winsound.Beep(1000, 500)  # 1000 Hz for 500 milliseconds
    print("Beep attempt completed.")

