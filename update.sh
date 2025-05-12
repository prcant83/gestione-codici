#!/bin/bash
cd /home/riccardo/gestione-codici
echo ">> Verifico aggiornamenti da GitHub..."
git pull origin main

echo ">> Riavvio server con PM2..."
pm2 restart server

echo ">> Aggiornamento completato!"
