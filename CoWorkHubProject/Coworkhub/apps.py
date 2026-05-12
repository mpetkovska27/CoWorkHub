from django.apps import AppConfig


class CoworkhubConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'Coworkhub'

    def ready(self):
        import Coworkhub.signals
