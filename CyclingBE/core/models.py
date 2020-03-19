from django.contrib.auth.models import User
from django.db import models
from django.core.cache import cache
import mpu



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

    def calculate_general_trip_stats(self):
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

                # Max speed will be aviable only after finishing trip

                cache.set('currently_active_trip_stats', True, 180) # Don't calculate new stats more often than once in 3 minutes (and beacuse of that last parameter should be 180 (60 seconds * 3 minutes = 180))
                self.save()

        return self


    def __str__(self):
        return str(self.created_date)

class Point(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    lon = models.FloatField(default=0.0)
    lat = models.FloatField(default=0.0)
    timestamp = models.BigIntegerField(default=0)
    was_paused = models.BooleanField(default=False)# was trip paused at moment of recording this point?

    class Meta:
        unique_together = ('trip', 'lon', 'lat', 'timestamp')
