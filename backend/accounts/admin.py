from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['username', 'email', 'role', 'department', 'is_active', 'is_staff']
    list_filter = ['role', 'is_active', 'is_staff', 'department']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'badge_number']
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Platform Info', {'fields': ('role', 'phone', 'department', 'badge_number')}),
    )
