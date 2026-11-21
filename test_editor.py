"""Geometry and AI proposal boundary regression checks; no live API calls."""
import copy
import io
import json
import unittest
import base64
from unittest.mock import patch
import server


class EditorTests(unittest.TestCase):
    def setUp(self):
        self.project = {'room': {'width': 5, 'depth': 4, 'confirmed': True},
                        'items': [], 'walls': [{'x1': 0, 'y1': 0, 'x2': 5, 'y2': 0,
                        'height': 2.7, 'thickness': .12, 'openings': [
                        {'kind': 'door', 'offset': 1, 'width': .9, 'height': 2.1, 'sill': 0}]}]}

    def test_opening_must_fit_wall(self):
        server.validate(self.project)
        for field, value in [('width', 8), ('height', 4), ('offset', -1), ('sill', float('nan'))]:
            with self.subTest(field=field):
                candidate = copy.deepcopy(self.project)
                candidate['walls'][0]['openings'][0][field] = value
                with self.assertRaises(ValueError):
                    server.validate(candidate)

    def test_measurements_are_recomputed(self):
        self.project['measurements'] = [
            {'type': 'distance', 'points': [{'x': 0, 'y': 0}, {'x': 3, 'y': 4}], 'value': 999},
            {'type': 'area', 'points': [{'x': 0, 'y': 0}, {'x': 3, 'y': 0}, {'x': 3, 'y': 2}, {'x': 0, 'y': 2}], 'value': 999}]
        server.validate(self.project)
        self.assertEqual([m['value'] for m in self.project['measurements']], [5, 6])

    def test_furniture_can_move_and_rotate_but_not_resize(self):
        baseline = {'items': [{'id': 'bed', 'width': 1.6, 'depth': 2, 'height': .65, 'x': 1, 'rotation': 0}]}
        candidate = copy.deepcopy(baseline)
        candidate['items'][0].update(x=3, rotation=90)
        server.check_fixed_furniture_sizes(candidate, baseline)
        for field in ('width', 'depth', 'height'):
            resized = copy.deepcopy(candidate)
            resized['items'][0][field] += .1
            with self.assertRaisesRegex(ValueError, 'sizes are fixed'):
                server.check_fixed_furniture_sizes(resized, baseline)

    def test_new_room_bounds(self):
        self.project['rooms'] = [{'name': 'Study', 'vertices': [{'x': 0, 'y': 0}, {'x': 2, 'y': 0}, {'x': 2, 'y': 3}, {'x': 0, 'y': 3}]}]
        server.validate(self.project)
        self.project['rooms'][0]['vertices'][0]['x'] = -1
        with self.assertRaisesRegex(ValueError, 'Room corners'):
            server.validate(self.project)

    def test_multiple_openings_allowed_but_overlap_rejected(self):
        self.project['walls'][0]['openings'].append({'kind': 'window', 'offset': 2.2, 'width': 1.2, 'height': 1.2, 'sill': .9})
        server.validate(self.project)
        self.project['walls'][0]['openings'][1]['offset'] = 1.5
        with self.assertRaisesRegex(ValueError, 'cannot overlap'):
            server.validate(self.project)

    def test_annotation_bounds(self):
        self.project['annotations'] = [{'type': 'rectangle', 'x': 1, 'y': 1, 'x2': 8, 'y2': 2}]
        with self.assertRaisesRegex(ValueError, 'inside the plan'):
            server.validate(self.project)

    def test_pdf_rejects_non_pdf(self):
        with patch('shutil.which', return_value='/bin/pdftoppm'):
            with self.assertRaisesRegex(ValueError, 'PDF under'):
                server.import_pdf({'pdf': base64.b64encode(b'not a pdf').decode()})

    @patch.dict('os.environ', {'OPENAI_API_KEY': ''})
    def test_missing_credentials(self):
        with self.assertRaisesRegex(ValueError, 'not connected'):
            server.propose_ai_edit({'project': self.project, 'message': 'Trace walls'})

    @patch.dict('os.environ', {'OPENAI_API_KEY': 'test-placeholder'})
    def test_ai_proposal_does_not_mutate_original(self):
        original = copy.deepcopy(self.project)
        proposal = {'summary': 'Move the wall.', 'items': [], 'walls': copy.deepcopy(self.project['walls'])}
        proposal['walls'][0]['y1'] = .5
        proposal['walls'][0]['y2'] = .5
        response = {'output': [{'content': [{'type': 'output_text', 'text': json.dumps(proposal)}]}]}
        with patch('urllib.request.urlopen', return_value=io.BytesIO(json.dumps(response).encode())):
            result = server.propose_ai_edit({'project': self.project, 'message': 'Move wall'})
        self.assertEqual(self.project, original)
        self.assertEqual(result['project']['walls'][0]['y1'], .5)
        self.assertFalse(result['project']['room']['confirmed'])


if __name__ == '__main__':
    unittest.main()
