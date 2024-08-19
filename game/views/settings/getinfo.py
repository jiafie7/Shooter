from django.http import JsonResponse, HttpResponse
from game.models.player.player import Player

def getinfo_acapp(request):
    user = request.user
    player = Player.objects.get(user=user)
    return JsonResponse({
        "result": "success",
        "username": player.user.username,
        "photo": player.photo,
    })


def getinfo_web(request):
    user = request.user
    if not user.is_authenticated:
        print("ok")
        return JsonResponse({
            "result": "HAVEN'T LOGIN"
        })
    else:
        player = Player.objects.get(user=user)
        return JsonResponse({
            "result": "success",
            "username": player.user.username,
            "photo": player.photo,
        })



def getinfo(request):
    platform = request.GET.get('platform')
    if platform == "ACAPP":
        return getinfo_acapp(request)
    elif platform == "WEB":
        return getinfo_web(request)
    
