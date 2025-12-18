# apps/quoting/urls.py

from django.urls import path
from .views import InstantQuoteView

urlpatterns = [
    path('instant-estimate/', InstantQuoteView.as_view(), name='instant-quote'),
]
