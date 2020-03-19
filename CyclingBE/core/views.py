from django.shortcuts import render
from rest_framework import viewsets, mixins
from django.contrib.auth.models import User
from core.serializers import *
from rest_framework import permissions
from rest_framework.response import Response
from django.core import serializers
from core.permissions import *
from rest_framework.decorators import api_view, action


# Create your views here.
class UserIdViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        return User.objects.filter(pk=self.request.user.id)


# Viewset that excludes updateModelMixin
class TripViewset(mixins.RetrieveModelMixin, mixins.ListModelMixin, mixins.DestroyModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    queryset = Trip.objects.all()
    serializer_class = TripSerializer

    def searchForActiveTrip(self, request):
        trip = Trip.objects.filter(owner=request.user, is_finished=False).first()
        if trip:
            trip = trip.calculateGeneralTripStats()
            return trip
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
        instance = self.searchForActiveTrip(request)
        if instance:
            instance.is_finished = True
            instance.save()
            instance.createOneIn60SecondsPoints()
            return Response(self.get_serializer(instance).data)
        else:
            return Response("NO_TRIP_WAS_ACTIVE_ANYWAY")


# Viewset that excludes updateModelMixin, and destroyModelMixin
class PointViewset(mixins.RetrieveModelMixin, mixins.ListModelMixin, mixins.CreateModelMixin, viewsets.GenericViewSet):
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

class Point60Viewset(mixins.RetrieveModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    serializer_class = Point60Serializer
    queryset = Point60.objects.all()

    def list(self, request, *args, **kwargs):
        trip_id = request.query_params.get('trip')
        trip = Trip.objects.filter(pk=trip_id)
        if trip_id and trip.exists():
            trip = trip.first()
            points = Point60.objects.filter(trip=trip)
            return Response(self.get_serializer(points, many=True).data)
        else:
            return Response("INCORRECT_OR_NONEXISTENT_TRIP_ID_PROVIDED")


# View responsible for receiving live data from AFE
'''
Example input value
[
    {
        "lat": 2.0048170349561962,
        "lon": -134.5184974689895,
        "timestamp": 1584559628000,
        "trip": 5,
        "was_paused": false
    },
    {
        "lat":49.682981826485005,
        "lon":-160.74046945502633,
        "timestamp":1584559636000,
        "trip": 5,
        "was_paused": false
    }
]
'''
@api_view(['POST'])
def receivePoints(request):
    try:
        for point in request.data:
            trip = Trip.objects.filter(pk=point["trip"], is_finished=False).first()
            if trip:
                print("creatin")
                Point.objects.create(trip=trip, lon=point["longitude"], lat=point["latitude"], timestamp=point["timestamp"], was_paused=point["was_paused"])
            else:
                return Response("GIVEN_TRIP_ID_IS_INACTIVE")
    except:
        print("Received the same spot before, ignoring")
    return Response("POST_RESPONSE")
