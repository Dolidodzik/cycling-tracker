"""CyclingBE URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from rest_framework.authtoken.views import obtain_auth_token
from core.views import receivePoints

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v0/core/', include('core.urls')),
    path('api/v0/token_auth/', obtain_auth_token, name='api_token_auth'), # for token login

    path('api/v0/drf_urls/', include('rest_framework.urls', namespace='rest_framework')),
    path('api/v0/rest_registration/', include('rest_registration.api.urls')),
    path('api/v0/rest_registration/register/', admin.site.urls), # Blocking way to create any new users. Only users created using python manage.py createsuperuser can exist in this app, for now.
    path('api/v0/receivepoints/', receivePoints)
]
