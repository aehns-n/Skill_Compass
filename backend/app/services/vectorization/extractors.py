"""
SkillCompass — Multi-Format Content Extractors (Stage 3)
Extracts clean semantic text and structural metadata from HTML, PDF, Markdown, and Transcripts.
"""

import re
from typing import Dict, Any, List
from bs4 import BeautifulSoup

class HTMLExtractor:
    """Extracts structured text and code blocks from HTML documents using BeautifulSoup."""

    @staticmethod
    def extract(html_content: str) -> Dict[str, Any]:
        soup = BeautifulSoup(html_content, "html.parser")
        
        # Remove unwanted script, style, and navigation tags
        for element in soup(["script", "style", "nav", "footer", "header", "noscript"]):
            element.extract()

        # Extract title
        title = ""
        if soup.title and soup.title.string:
            title = soup.title.string.strip()
        elif soup.find("h1"):
            title = soup.find("h1").get_text(strip=True)

        # Extract code snippets
        code_blocks = [code.get_text() for code in soup.find_all(["pre", "code"])]

        # Extract clean plain text
        lines = (line.strip() for line in soup.get_text().splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        clean_text = "\n".join(chunk for chunk in chunks if chunk)

        return {
            "title": title,
            "text": clean_text,
            "code_blocks": code_blocks,
            "char_count": len(clean_text)
        }


class MarkdownExtractor:
    """Extracts sections, headings, and code blocks from Markdown files."""

    @staticmethod
    def extract(markdown_content: str) -> Dict[str, Any]:
        lines = markdown_content.splitlines()
        headings = []
        code_blocks = []
        in_code_block = False
        curr_code = []

        for line in lines:
            if line.strip().startswith("```"):
                if in_code_block:
                    code_blocks.append("\n".join(curr_code))
                    curr_code = []
                    in_code_block = False
                else:
                    in_code_block = True
                continue

            if in_code_block:
                curr_code.append(line)
            elif line.strip().startswith("#"):
                headings.append(line.strip())

        # Clean text
        clean_text = re.sub(r'```[\s\S]*?```', '', markdown_content)
        clean_text = re.sub(r'[#*_`\[\]]', ' ', clean_text)
        clean_text = " ".join(clean_text.split())

        return {
            "headings": headings,
            "text": clean_text,
            "code_blocks": code_blocks,
            "char_count": len(clean_text)
        }


class PDFExtractor:
    """Extracts text from PDF documents using pypdf."""

    @staticmethod
    def extract_from_stream(pdf_file_stream) -> Dict[str, Any]:
        try:
            import pypdf
            reader = pypdf.PdfReader(pdf_file_stream)
            pages_text = []
            for idx, page in enumerate(reader.pages):
                txt = page.extract_text() or ""
                if txt.strip():
                    pages_text.append(f"--- Page {idx+1} ---\n" + txt.strip())
            full_text = "\n\n".join(pages_text)
            return {
                "total_pages": len(reader.pages),
                "text": full_text,
                "char_count": len(full_text)
            }
        except Exception as e:
            return {
                "total_pages": 0,
                "text": f"PDF parse error: {str(e)}",
                "char_count": 0
            }


class TranscriptExtractor:
    """Extracts coherent narrative text from timestamped video/audio transcripts."""

    @staticmethod
    def extract(transcript_content: str) -> Dict[str, Any]:
        # Strip timestamps like [00:15] or 00:00:15
        clean_text = re.sub(r'\[?\d{1,2}:\d{2}(?::\d{2})?\]?', '', transcript_content)
        clean_text = " ".join(clean_text.split())
        return {
            "text": clean_text,
            "char_count": len(clean_text)
        }
