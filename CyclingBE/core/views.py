from django.shortcuts import render
from rest_framework import viewsets
from django.contrib.auth.models import User
from core.serializers import *
from rest_framework import permissions
from rest_framework.response import Response
from django.core import serializers
from core.permissions import *

# Create your views here.
class UserIdViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return User.objects.filter(pk=self.request.user.id)



class TripViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def searchForActiveTrip(self, request):
        trip = Trip.objects.filter(owner=request.user, is_finished=False)
        if trip.exists():
            return trip.first()
        else:
            return False

    def retrieve(self, request, pk=None):
        search_for_currently_active_trip = request.query_params.get('search_for_currently_active_trip')
        if search_for_currently_active_trip:
            trip = self.searchForActiveTrip(request)
            if trip:
                return Response(self.get_serializer(trip).data)
            else:
                return Response("NO_ACTIVE_TRIP")
        else:
            trip = self.get_object()
            return Response(self.get_serializer(trip).data)

    def create(self, request, *args, **kwargs):
        if self.searchForActiveTrip(request):
            return Response("some_trip_is_already_active")
        else:
            return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_finished = True
        instance.save()
        return Response(self.get_serializer(instance).data)


class PointInvitationViewset(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    serializer_class = PointSerializer
    queryset = Point.objects.all()

    def list(self, request, *args, **kwargs):
        trip_id = request.query_params.get('trip')
        trip = Trip.objects.filter(pk=trip_id)
        if trip_id and trip.exists():
            trip = trip.first()
            points = Point.objects.filter(trip=trip)
            return Response(self.get_serializer(points, many=True).data)
        else:
            return Response("INCORRECT_OR_NONEXISTENT_TRIP_ID_PROVIDED")
