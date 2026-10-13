from .models import User

class AccountService:
    @staticmethod
    def get_or_create_default_users():
        users_to_create = [
            {'username': 'admin', 'email': 'admin@lambda.ai', 'role': 'ADMIN', 'is_staff': True, 'is_superuser': True},
            {'username': 'operator', 'email': 'operator@lambda.ai', 'role': 'OPERATOR', 'is_staff': False},
            {'username': 'analyst', 'email': 'analyst@lambda.ai', 'role': 'ANALYST', 'is_staff': False},
            {'username': 'viewer', 'email': 'viewer@lambda.ai', 'role': 'VIEWER', 'is_staff': False},
        ]
        created_users = []
        for user_data in users_to_create:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'role': user_data['role'],
                    'is_staff': user_data.get('is_staff', False),
                    'is_superuser': user_data.get('is_superuser', False),
                }
            )
            if created:
                user.set_password('Admin@1234')
                user.save()
            created_users.append(user)
        return created_users
