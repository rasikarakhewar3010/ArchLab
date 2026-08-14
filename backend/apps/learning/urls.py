from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ResourceViewSet, StudyPathViewSet, UserProgressViewSet

router = DefaultRouter()
router.register(r'resources', ResourceViewSet, basename='resource')
router.register(r'paths', StudyPathViewSet, basename='study-path')
router.register(r'progress', UserProgressViewSet, basename='user-progress')

urlpatterns = [
    path('', include(router.urls)),
]
