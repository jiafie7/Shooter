from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth.models import User
from game.models.player.player import Player

def register(request):
    print(1)
    username = request.GET.get("username", "").strip()
    password = request.GET.get("password", "").strip()
    password_confirm = request.GET.get("password_confirm", "").strip()

    if not username or not password:
        return JsonResponse({
            'result': "Username or password is empty",
        })
    if password != password_confirm:
        return JsonResponse({
            'result': "Passwords are inconsistent",
        })
    if User.objects.filter(username=username).exists():
        return JsonResponse({
            'result': "Username already exist"
        })

    user = User(username=username)
    user.set_password(password)
    user.save()
    Player.objects.create(user=user, photo="http://img1.baidu.com/it/u=630174145,1377166890&fm=253&app=138&f=JPEG?w=824&h=800")
        
    login(request, user)
    return JsonResponse({
        'result': "success",
    })
