import datetime
from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'description', 'creationDate', 'limitDate', 'completed')
    search_fields = ('title', 'description')