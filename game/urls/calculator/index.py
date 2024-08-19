from django.urls import path, re_path
from game.views.calculator.login import signIn
from game.views.calculator.logout import signOut
from game.views.calculator.register import register
from game.views.calculator.get_status import getStatus
from game.views.calculator.index import calculator

urlpatterns = [
        #path('getinfo/', getinfo, name="calculator_getinfo"),
    path('login/', signIn, name="calculator_login"),
    path('logout/', signOut, name="calculator_logout"),
    path('register/', register, name="calculator_register"),
    path('get_status/', getStatus, name="calculator_get_status"),
    re_path(r".*", calculator, name="calculator"),
]
