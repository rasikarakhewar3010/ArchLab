from django.urls import path
from .views import analyze_architecture

urlpatterns = [
    path('analyze/', analyze_architecture, name='analyze-architecture'),
]
