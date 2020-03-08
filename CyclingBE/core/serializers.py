from core.models import *
from django.contrib.auth.models import User
from rest_framework import serializers
from django.core import serializers as django_serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
