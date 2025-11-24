#!/bin/bash
echo ">>> Instalando dependencias..."
cd ../web-bff && npm install
cd ../api && npm install

echo ">>> Copiando servicios systemd..."
sudo cp web-bff.service /etc/systemd/system/
sudo cp api.service /etc/systemd/system/

echo ">>> Recargando demonios..."
sudo systemctl daemon-reload
sudo systemctl enable web-bff api
sudo systemctl start web-bff api

echo ">>> ¡Listo! Servicios corriendo en segundo plano."