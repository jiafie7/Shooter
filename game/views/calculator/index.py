from django.shortcuts import render

def calculator(request):
    return render(request, "calculator/index.html")
