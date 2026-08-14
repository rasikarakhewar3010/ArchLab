from django.test import TestCase
from .analyzer import analyze_design
from .ai_chat import get_chat_response, suggest_next_components

class AIAnalyzerTests(TestCase):
    def test_empty_design_analysis(self):
        result = analyze_design([], [])
        self.assertEqual(result['score'], 0)
        self.assertEqual(result['component_count'], 0)
        self.assertTrue(any(issue['title'] == 'Empty Design' for issue in result['issues']))

    def test_client_database_security_rule(self):
        nodes = [
            {'id': '1', 'data': {'componentType': 'client', 'label': 'Web App'}},
            {'id': '2', 'data': {'componentType': 'database_sql', 'label': 'Postgres'}},
        ]
        edges = [{'source': '1', 'target': '2'}]
        
        result = analyze_design(nodes, edges)
        
        # Should flag the critical security issue
        security_issues = [i for i in result['issues'] if i['title'] == 'Client Directly Connected to Database']
        self.assertEqual(len(security_issues), 1)
        self.assertEqual(security_issues[0]['severity'], 'critical')

    def test_suggest_next_components(self):
        # Only client, should suggest Gateway or DB
        nodes = [{'id': '1', 'data': {'componentType': 'client'}}]
        suggestions = suggest_next_components(nodes, [])
        types = [s['component_type'] for s in suggestions]
        self.assertIn('api_gateway', types)

    def test_knowledge_base_chat(self):
        response = get_chat_response("tell me about redis and caching")
        self.assertEqual(response['powered_by'], 'knowledge_base')
        self.assertIn('Cache-Aside', response['response'])
