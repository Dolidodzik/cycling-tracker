from rest_framework import routers
from core.views import *

router = routers.DefaultRouter()
#router.register(r'users', UserViewset)
router.register(r'user_id', UserIdViewSet, basename="user_id")
router.register(r'trips', TripViewset, basename="trips")
router.register(r'points', PointInvitationViewset, basename="points")
urlpatterns = router.urls
