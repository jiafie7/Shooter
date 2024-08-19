from django.http import JsonResponse
from django.contrib.auth import authenticate, login

def getStatus(request):
    user = request.user
    if user.is_authenticated:
        return JsonResponse({
            'result': "login",
            'username': user.username
        })
    else:
        return JsonResponse({
            'result': "logout"
        })
