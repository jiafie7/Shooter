from django.http import JsonResponse
from django.contrib.auth import authenticate, login

def signIn(request):
    username = request.GET.get('username')
    password = request.GET.get('password')
    user = authenticate(request, username=username, password=password)

    if not username or not password:
        return JsonResponse({
            'result': "Username or password is empty",
        })

    if user is not None:
        login(request, user)
        return JsonResponse({
            'result': "success",
        })
    else:
        return JsonResponse({
            'result': "Incorrect username or password"
        })
