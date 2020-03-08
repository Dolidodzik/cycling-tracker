from django.shortcuts import render
from rest_framework import viewsets
from django.contrib.auth.models import User
from core.serializers import *
from rest_framework import permissions
from rest_framework.response import Response
from django.core import serializers

# Create your views here.
class UserIdViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return User.objects.filter(id=self.request.user.id)
