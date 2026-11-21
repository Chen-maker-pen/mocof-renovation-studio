"""Stateless Vercel entrypoint. Never persists one visitor's projects for another."""
import os
import sys
from pathlib import Path
from urllib.parse import urlsplit

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault('STUDIO_DB', '/tmp/mocof-portfolio-catalog.sqlite3')
from server import Handler, initialize

initialize()


class handler(Handler):
    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/health':
            return self.respond({'status': 'ok', 'edition': 'portfolio', 'project_storage': 'visitor_browser'})
        if path == '/api/projects':
            return self.respond({'error': 'Demo projects are saved in your browser.'}, 400)
        if path != '/api/catalog':
            return self.respond({'error': 'Unknown API endpoint'}, 404)
        return super().do_GET()

    def do_POST(self):
        path = urlsplit(self.path).path
        if path == '/api/ai/edit':
            return self.respond({'error': 'Live AI is disabled in this public demo. Optional AI integration is included in the Python source.'}, 403)
        if path != '/api/quote':
            return self.respond({'error': 'This feature is available in the local Python app. Demo projects save in your browser.'}, 400)
        return super().do_POST()
