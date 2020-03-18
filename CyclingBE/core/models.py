from django.contrib.auth.models import User
from django.db import models

class Trip(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    modified_date = models.DateTimeField(auto_now=True, blank=True, null=True)
    is_finished = models.BooleanField(default=False)

    def __str__(self):
        return str(self.created_date)

class Point(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    lon = models.FloatField(default=0.0)
    lat = models.FloatField(default=0.0)
    timestamp = models.BigIntegerField(default=0)
