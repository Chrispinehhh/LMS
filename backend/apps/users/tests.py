from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from firebase_admin import auth

User = get_user_model()

class CreateUserViewTests(APITestCase):
    def setUp(self):
        # Create an admin user to bypass permission checks
        self.admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpassword',
            role='ADMIN'  # Explicitly set key role
        )
        self.client.force_authenticate(user=self.admin)
        self.url = reverse('api:user-create')
        self.valid_payload = {
            'email': 'newuser@example.com',
            'password': 'password123',
            'first_name': 'New',
            'last_name': 'User',
            'role': 'DRIVER'
        }

    @patch('apps.users.views.auth.create_user')
    def test_create_user_success(self, mock_create_user):
        """
        Verify that user is created in both Firebase and local DB on success.
        """
        # Mock Firebase user
        mock_firebase_user = MagicMock()
        mock_firebase_user.uid = 'firebase_uid_123'
        mock_create_user.return_value = mock_firebase_user

        response = self.client.post(self.url, self.valid_payload)
        
        # Check response
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], self.valid_payload['email'])
        self.assertEqual(response.data['username'], 'firebase_uid_123')
        
        # Check local DB
        self.assertTrue(User.objects.filter(username='firebase_uid_123').exists())
        self.assertTrue(User.objects.filter(email=self.valid_payload['email']).exists())

    @patch('apps.users.views.auth.create_user')
    def test_firebase_config_error(self, mock_create_user):
        """
        Verify that a 503 is returned if Firebase is not properly configured.
        """
        mock_create_user.side_effect = ValueError("The default Firebase app does not exist")
        
        response = self.client.post(self.url, self.valid_payload)
        
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertIn("error", response.data)

    @patch('apps.users.views.auth.create_user')
    def test_firebase_email_exists(self, mock_create_user):
        """
        Verify that a 409 is returned if the email already exists in Firebase.
        """
        # EmailAlreadyExistsError requires cause and http_response
        mock_create_user.side_effect = auth.EmailAlreadyExistsError("Email exists", None, None)
        
        response = self.client.post(self.url, self.valid_payload)
        
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    @patch('apps.users.views.auth.create_user')
    @patch('apps.users.views.auth.delete_user')
    @patch('apps.users.models.User.objects.create_user')
    def test_local_db_failure_rolls_back_firebase(self, mock_local_create, mock_delete_user, mock_firebase_create):
        """
        Verify that if local DB creation fails, the Firebase user is deleted.
        """
        # Mock Firebase success
        mock_firebase_user = MagicMock()
        mock_firebase_user.uid = 'firebase_uid_fail'
        mock_firebase_create.return_value = mock_firebase_user
        
        # Mock local DB failure
        mock_local_create.side_effect = Exception("Database error")
        
        response = self.client.post(self.url, self.valid_payload)
        
        # Should be 500
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # Verify Firebase rollback called
        mock_delete_user.assert_called_once_with('firebase_uid_fail')
        
        
        # Verify no local user exists (mocked anyway, but logical check)
        self.assertFalse(User.objects.filter(username='firebase_uid_fail').exists())


class FirebaseLoginViewTests(APITestCase):
    def setUp(self):
        self.url = reverse('api:firebase_login')
        self.valid_payload = {'token': 'valid_firebase_token'}

    @patch('apps.users.views.auth.verify_id_token')
    def test_login_success_creates_user(self, mock_verify_token):
        """
        Verify new user is created upon successful Firebase login.
        """
        mock_verify_token.return_value = {
            'uid': 'firebase_uid_new',
            'email': 'new@example.com',
            'name': 'New User'
        }

        response = self.client.post(self.url, self.valid_payload)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that user was created
        self.assertTrue(User.objects.filter(username='firebase_uid_new').exists())

    @patch('apps.users.views.auth.verify_id_token')
    def test_login_success_existing_user(self, mock_verify_token):
        """
        Verify login works for existing user without creating duplicate.
        """
        # Create user first
        User.objects.create_user(username='firebase_uid_existing', email='existing@example.com')
        
        mock_verify_token.return_value = {
            'uid': 'firebase_uid_existing',
            'email': 'existing@example.com',
            'name': 'Existing User'
        }

        response = self.client.post(self.url, self.valid_payload)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(User.objects.filter(username='firebase_uid_existing').count(), 1)

    @patch('apps.users.views.auth.verify_id_token')
    def test_firebase_config_error(self, mock_verify_token):
        """
        Verify 503 is returned if Firebase is not properly configured.
        """
        mock_verify_token.side_effect = ValueError("The default Firebase app does not exist")
        
        response = self.client.post(self.url, self.valid_payload)
        
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @patch('apps.users.views.auth.verify_id_token')
    def test_invalid_token(self, mock_verify_token):
        """
        Verify 401 is returned for invalid tokens.
        """
        mock_verify_token.side_effect = auth.InvalidIdTokenError("Invalid token")
        
        response = self.client.post(self.url, self.valid_payload)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
