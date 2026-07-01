#!/usr/bin/env python3
"""PDFを強制ダウンロードさせるサーバー（Content-Disposition: attachment）"""
import os
from http.server import HTTPServer, BaseHTTPRequestHandler

DIR = os.path.dirname(os.path.abspath(__file__))
PDF_NAME = "LUMINA-FILM-proposal.pdf"
ZIP_NAME = "LUMINA-FILM-proposal.zip"
PDF_PATH = os.path.join(DIR, PDF_NAME)
ZIP_PATH = os.path.join(DIR, ZIP_NAME)

MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css",
    ".js": "application/javascript",
    ".png": "image/png",
}


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

    def do_GET(self):
        path = self.path.split("?")[0]

        if path in ("/download-pdf", f"/{PDF_NAME}"):
            return self.serve_pdf(force_download=True)

        if path in ("/download-zip", f"/{ZIP_NAME}"):
            return self.serve_zip()

        if path == "/view-pdf":
            return self.serve_pdf(force_download=False)

        if path in ("/", "/download.html"):
            return self.serve_file("download.html")

        rel = path.lstrip("/")
        filepath = os.path.join(DIR, rel)
        if os.path.isfile(filepath) and filepath.startswith(DIR):
            ext = os.path.splitext(filepath)[1].lower()
            return self.send_bytes(
                open(filepath, "rb").read(),
                MIME.get(ext, "application/octet-stream"),
                os.path.basename(filepath),
                force_download=ext == ".pdf",
            )

        self.send_error(404)

    def serve_file(self, name):
        filepath = os.path.join(DIR, name)
        with open(filepath, "rb") as f:
            data = f.read()
        self.send_bytes(data, "text/html; charset=utf-8", name, force_download=False)

    def serve_pdf(self, force_download=True):
        if not os.path.isfile(PDF_PATH):
            self.send_error(404, "PDF not found")
            return
        with open(PDF_PATH, "rb") as f:
            data = f.read()
        ctype = "application/octet-stream" if force_download else "application/pdf"
        self.send_bytes(data, ctype, PDF_NAME, force_download=force_download)

    def serve_zip(self):
        if not os.path.isfile(ZIP_PATH):
            self.send_error(404, "ZIP not found")
            return
        with open(ZIP_PATH, "rb") as f:
            data = f.read()
        self.send_bytes(data, "application/zip", ZIP_NAME, force_download=True)

    def send_bytes(self, data, content_type, filename, force_download=False):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(data)))
        self.send_header("Cache-Control", "no-cache")
        if force_download:
            self.send_header(
                "Content-Disposition",
                f'attachment; filename="{filename}"',
            )
        else:
            self.send_header("Content-Disposition", f'inline; filename="{filename}"')
        self.end_headers()
        self.wfile.write(data)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "8081"))
    server = HTTPServer(("0.0.0.0", port), Handler)
    print(f"Serving on http://0.0.0.0:{port}")
    server.serve_forever()
