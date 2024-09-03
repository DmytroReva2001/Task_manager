from django.shortcuts import render
from .models import Task

# Create your views here.
def task_managment_view(request):
    tasks = Task.objects.all()
    return render (request, 'index.html', {'tasks': tasks})

def create_task_view(request):
    return render (request, 'createTask.html')
