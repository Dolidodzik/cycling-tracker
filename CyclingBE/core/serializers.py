from core.models import *
from django.contrib.auth.models import User
from rest_framework import serializers
from django.core import serializers as django_serializers

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')

class PointSerializer(serializers.ModelSerializer):
    class Meta:
        model = Point
        fields = ('id', 'trip', 'lon', 'lat', 'timestamp', 'was_paused')

class Point60Serializer(serializers.ModelSerializer):
    class Meta:
        model = Point60
        fields = ('id', 'trip', 'lon', 'lat', 'timestamp', 'was_paused')

class TripSerializer(serializers.ModelSerializer):

    last_10_positions = serializers.SerializerMethodField('last10Positions')

    def last10Positions(self, instance):
        last_10_positions = Point.objects.filter(trip=instance).order_by('timestamp')[:-10]
        return PointSerializer(last_10_positions, many=True).data

    class Meta:
        model = Trip
        fields = ('id', 'owner', 'created_date', 'modified_date', 'is_finished', 'distance', 'time', 'avg_speed', 'max_speed', 'last_pos_lat', 'last_pos_lon', 'number_of_points', 'last_10_positions')
        read_only_fields = ('created_date', 'modified_date', 'is_finished', 'distance', 'time', 'avg_speed', 'max_speed', 'last_pos_lat', 'last_pos_lon', 'number_of_points')
