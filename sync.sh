#!/bin/bash
cd /home/riccardo/gestione-codici

echo "🔁 Sincronizzazione bidirezionale con GitHub..."

echo "⬇️  Pull da GitHub..."
git pull origin main --no-rebase

echo "📝 Aggiunta modifiche locali..."
git add .

echo "💬 Inserisci messaggio commit:"
read msg
git commit -m "$msg"

echo "⬆️  Push verso GitHub..."
git push

echo "✅ Sincronizzazione completata!"
