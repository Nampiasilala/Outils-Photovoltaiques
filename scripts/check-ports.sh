#!/bin/bash
PORTS=(3000 8000 5433)
CONFLICTS=false

for port in "${PORTS[@]}"; do
    if lsof -i :$port > /dev/null 2>&1; then
        echo "❌ Port $port occupé"
        lsof -i :$port
        CONFLICTS=true
    else
        echo "✅ Port $port libre"
    fi
done

if [ "$CONFLICTS" = true ]; then
    echo "🛑 Libérez les ports avant de continuer"
    exit 1
fi