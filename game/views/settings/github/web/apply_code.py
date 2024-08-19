from django.http import JsonResponse
from urllib.parse import quote
from random import randint
from django.core.cache import cache


def get_state():
    res = ""
    for i in range(8):
        res += str(randint(0, 9))
    return res

# 向AcWing申请授权码Code
def apply_code(request):
    appid = "6791"
    redirect_uri = quote("http://127.0.0.1:8000/settings/acwing/web/receive_code/")
    scope = "userinfo"
    state = get_state()
    
    cache.set(state, True, 7200) # valid time 2 hours

    apply_code_url = "https://www.acwing.com/third_party/api/oauth2/web/authorize/"
    return JsonResponse({
        'result': "success",
        'apply_code_url': apply_code_url + "?appid=%s&redirect_uri=%s&scope=%s&state=%s" % (appid, redirect_uri, scope, state),

    })

    
