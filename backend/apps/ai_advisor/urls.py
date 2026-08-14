from django.urls import path
from .views import analyze_architecture, chat_with_advisor, suggest_improvements

urlpatterns = [
    path('analyze/', analyze_architecture, name='analyze-architecture'),
    path('chat/', chat_with_advisor, name='chat-with-advisor'),
    path('suggest/', suggest_improvements, name='suggest-improvements'),
]
