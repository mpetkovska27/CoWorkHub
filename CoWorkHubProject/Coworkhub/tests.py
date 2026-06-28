from django.test import TestCase, Client
from django.urls import reverse


class StatsAPITest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_stats_returns_200(self):
        response = self.client.get('/api/stats/')
        self.assertEqual(response.status_code, 200)

    def test_stats_returns_required_fields(self):
        response = self.client.get('/api/stats/')
        data = response.json()
        self.assertIn('active_reservations', data)
        self.assertIn('free_workspaces', data)
        self.assertIn('unpaid_invoices', data)


class CentersAPITest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_centers_returns_200(self):
        response = self.client.get('/api/centers/')
        self.assertEqual(response.status_code, 200)

    def test_centers_returns_list(self):
        response = self.client.get('/api/centers/')
        data = response.json()
        self.assertIsInstance(data, list)


class ReservationsAPITest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_reservations_returns_200(self):
        response = self.client.get('/api/reservations/')
        self.assertEqual(response.status_code, 200)

    def test_reservations_returns_dict_with_key(self):
        response = self.client.get('/api/reservations/')
        data = response.json()
        self.assertIn('reservations', data)
        self.assertIsInstance(data['reservations'], list)


class InvoicesAPITest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_invoices_returns_200(self):
        response = self.client.get('/api/invoices/')
        self.assertEqual(response.status_code, 200)

    def test_invoices_returns_dict_with_key(self):
        response = self.client.get('/api/invoices/')
        data = response.json()
        self.assertIn('invoices', data)
        self.assertIsInstance(data['invoices'], list)


class MembersAPITest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_members_returns_200(self):
        response = self.client.get('/api/members/')
        self.assertEqual(response.status_code, 200)

    def test_members_returns_list(self):
        response = self.client.get('/api/members/')
        data = response.json()
        self.assertIn('members', data)


class InvalidEndpointTest(TestCase):
    def setUp(self):
        self.client = Client()

    def test_invalid_endpoint_returns_404(self):
        response = self.client.get('/api/nonexistent/')
        self.assertEqual(response.status_code, 404)
