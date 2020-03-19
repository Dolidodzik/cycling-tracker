from django.contrib.auth.models import User
from django.db import models
from django.core.cache import cache
import mpu
import math
from django.db.models import Q


class Trip(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    modified_date = models.DateTimeField(auto_now=True, blank=True, null=True)
    is_finished = models.BooleanField(default=False)

    # Stats (general, for whole trip)
    distance = models.IntegerField(default=0) # in meters
    time = models.IntegerField(default=0) # in seconds
    avg_speed = models.FloatField(default=0) # in km/h
    max_speed = models.FloatField(default=0) # in km/h
    last_pos_lat = models.FloatField(default=0.0) # in latitude
    last_pos_lon = models.FloatField(default=0.0) # in longitude

    def calculateGeneralTripStats(self):
        not_calculate = cache.get('currently_active_trip_stats')
        #if not self.is_finished and not not_calculate:
        if True:
            points = Point.objects.filter(trip=self, was_paused=False)
            if points.exists():
                # Calculating distance
                distance = 0
                prev_point = None
                for point in points:
                    if prev_point:
                        distance += mpu.haversine_distance((prev_point.lat, prev_point.lon), (point.lat, point.lon))
                    prev_point = point
                self.distance = round(distance*1000) # in meters

                # Calculating time
                self.time = (points.last().timestamp - points.first().timestamp)/1000 #/1000 to get seconds

                # Calculating avg_speed - dirty but short solution
                self.avg_speed = round(distance/(self.time/3600)/1000, 3)

                # saving last position
                self.last_pos_lat = points.last().lat
                self.last_pos_lon = points.last().lon

                # Max speed will be aviable only after finishing trip

                cache.set('currently_active_trip_stats', True, 180) # Don't calculate new stats more often than once in 3 minutes (and beacuse of that last parameter should be 180 (60 seconds * 3 minutes = 180))
                self.save()

        return self

    def createOneIn60SecondsPoints(self):
        print("executing")
        points = Point.objects.filter(trip=self, was_paused=False)
        self.calculateGeneralTripStats()
        if points.exists():
            start_timestamp = points.first().timestamp
            end_timestamp = points.last().timestamp
            print("start ", start_timestamp)
            print("stopp ", end_timestamp)
            diff = (end_timestamp - start_timestamp) / 1000
            loop_ticks = math.floor(diff/60)
            for x in range(loop_ticks):
                print("Tick: ",x+1)

                point = Point.objects.all().filter(timestamp__gte=start_timestamp+60*x, timestamp__lte=start_timestamp+60*x+60)
                print(point)
                #Point.objects.create(trip=point.trip, lon=point.lon, lat=point.lat, timestamp=point.timestamp)

    def __str__(self):
        return str(self.created_date)

class PointAbstract(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    lon = models.FloatField(default=0.0)
    lat = models.FloatField(default=0.0)
    timestamp = models.BigIntegerField(default=0)
    was_paused = models.BooleanField(default=False)# was trip paused at moment of recording this point?
    class Meta:
        unique_together = ('trip', 'lon', 'lat', 'timestamp')
        abstract = True

# Standard Point, represents position recorded at AFE. Typical frquency is 1 point, few seconds, 1 point etc.
class Point(PointAbstract):
    pass

# OneIn60Seconds point, the same as Point model, less accurate but also less resource (cpu/ram/internet connection) demanding. Instances of Point60 are created on trip end
class Point60(PointAbstract):
    pass
