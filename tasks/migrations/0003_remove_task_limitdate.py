# Generated by Django 5.1.1 on 2024-10-08 11:43

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0002_rename_date_task_creationdate_task_limitdate'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='task',
            name='limitDate',
        ),
    ]
