#!/bin/sh
echo "Waiting for database..."
while ! python -c "import psycopg2; psycopg2.connect(host='db', port=5432, dbname='coworking_db', user='postgres', password='2703')" 2>/dev/null; do
  echo "Database not ready, retrying in 2s..."
  sleep 2
done

echo "Database is ready!"

echo "Running migrations..."
python manage.py migrate --fake-initial

echo "Creating superuser..."
echo "from django.contrib.auth import get_user_model; U = get_user_model(); U.objects.filter(username='admin').exists() or U.objects.create_superuser('admin', 'admin@admin.com', 'admin')" | python manage.py shell

echo "Starting server..."
python manage.py runserver 0.0.0.0:8000