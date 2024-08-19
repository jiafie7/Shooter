from django.urls import path, include
from game.views.settings.getinfo import getinfo
from game.views.settings.login import signIn
from game.views.settings.logout import signOut
from game.views.settings.register import register

urlpatterns = [
    path('getinfo/', getinfo, name="settings_getinfo"),
    path('login/', signIn, name="settings_login"),
    path('logout/', signOut, name="settings_logout"),
    path('register/', register, name="settings_register"),
    path('github/', include("game.urls.settings.github.index")),
]


