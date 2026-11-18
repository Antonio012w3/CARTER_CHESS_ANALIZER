# CARTER CHESS ANALYZER

PWA para Android: analiza partidas terminadas a partir de un PGN usando Stockfish en el navegador.

## Publicar gratis con GitHub Pages
1. Descomprimí el ZIP.
2. Subí el contenido de esta carpeta a un repositorio de GitHub (los archivos deben quedar en la raíz).
3. En GitHub: **Settings → Pages → Deploy from a branch → main → /(root) → Save**.
4. Esperá a que GitHub Pages publique el sitio y abrí el enlace desde Chrome en Android.
5. En Chrome: menú ⋮ → **Agregar a pantalla principal** o **Instalar aplicación**.

## Uso
1. Abrí una partida ya finalizada en Chess.com y exportá/descargá su PGN.
2. Cargá el archivo o pegá el PGN.
3. Navegá por las posiciones con los controles.
4. Tocá **Analizar posición** para consultar Stockfish.

## Notas
- Requiere conexión a Internet la primera vez para descargar Chess.js y Stockfish.
- El motor lite single-threaded se usa por compatibilidad con móviles y hosting estático.
- Stockfish.js se distribuye bajo GPL-3.0. Consultá su licencia y avisos en https://github.com/nmrugg/stockfish.js
- Este proyecto es un punto de partida funcional; no ofrece sugerencias durante partidas en curso.
