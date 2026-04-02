

# 🔔 WakeUp! - Alarma Anti-Dormilonas

## Concepto
Una PWA instalable con diseño colorido y divertido que hace prácticamente imposible volver a dormirse. La alarma incluye múltiples desafíos con dificultad progresiva y mecanismos anti-trampas.

## Pantallas

### 1. Pantalla Principal (Reloj)
- Reloj grande con hora actual y próxima alarma
- Botón "+" para crear alarma
- Lista de alarmas configuradas con toggle on/off
- Diseño colorido con emojis y animaciones suaves
- Frase motivacional aleatoria del día

### 2. Crear/Editar Alarma
- Selector de hora
- Selector de días de la semana
- Elegir tipo de desafío (o aleatorio)
- Nivel de dificultad: Suave → Medio → Bestia → Imposible
- Etiqueta personalizable (ej: "¡LEVÁNTATE YA! 🏃‍♂️")

### 3. Pantalla de Alarma Sonando
- Pantalla completa con animaciones llamativas
- Sonido/vibración persistente
- Muestra el desafío a completar
- Contador de intentos fallidos visible
- No se puede cerrar sin completar el desafío

### 4. Desafíos (niveles progresivos)

**Nivel 1 - Suave:**
- Operaciones matemáticas simples (sumas/restas)
- Deslizar un patrón en pantalla

**Nivel 2 - Medio:**
- Multiplicaciones y divisiones
- Memorizar y repetir una secuencia de colores (tipo Simon)

**Nivel 3 - Bestia:**
- Ecuaciones con múltiples operaciones
- Escribir una frase larga sin errores
- Completar 3 desafíos seguidos

**Nivel 4 - Imposible:**
- Resolver problemas matemáticos complejos
- Secuencia de memoria de 8+ colores
- Escribir frase + resolver matemáticas + secuencia, todo seguido

### 5. Sistema Anti-Trampas
- Si cierras la app/pestaña, al reabrir la alarma sigue activa y el desafío **sube de nivel**
- La alarma se almacena en localStorage para persistir
- Notificaciones push para que vuelva a sonar si sales
- Mensaje burlón: "¿Intentaste escapar? Ahora es más difícil 😈"
- Pantalla completa inmersiva para dificultar salir

### 6. Pantalla de Victoria
- Animación de confeti/celebración al completar el desafío
- Mensaje motivacional divertido
- Estadísticas: racha de días despierto, tiempo promedio para apagar

## Funcionalidades Extra
- **Sonidos de alarma**: Varios tonos molestos pre-cargados
- **Modo gradual**: La alarma empieza suave y sube de volumen
- **Estadísticas**: Gráfico semanal de cuánto tardas en despertar
- **Instalable como PWA**: Se instala en la pantalla de inicio del móvil

## Diseño
- Paleta colorida: degradados violeta/naranja/rosa
- Emojis y micro-animaciones por toda la interfaz
- Tipografía grande y bold
- Tono humorístico en todos los textos
- Diseño mobile-first (optimizado para 360px)

## Limitaciones (transparencia)
- No puede impedir apagar el teléfono físicamente (ninguna app puede)
- El sonido de alarma depende del soporte del navegador
- Las notificaciones push requieren permiso del usuario

