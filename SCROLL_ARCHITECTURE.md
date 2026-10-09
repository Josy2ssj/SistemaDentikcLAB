# SCROLL ARCHITECTURE — DLSy V5

## Principios

DLSy es una **aplicación de escritorio**, no un sitio web. El comportamiento de scroll es crítico para la experiencia.

## Estructura de Scroll

### 1. SIDEBAR IZQUIERDA (152px)
- **Fija en viewport**
- `overflow: hidden`
- Sin scroll vertical
- Siempre visible

### 2. WORKSPACE CENTRAL (flex-1)
- **Cabe completo en viewport** (1920×1080)
- `overflow: hidden` en el contenedor principal
- Sin scroll general de página en desktop
- Estructura flex vertical:
  - Header (flex-shrink-0)
  - Quick Actions (flex-shrink-0)
  - Timeline (flex-1, crece para llenar espacio)
  - Recent Orders (flex-shrink-0)

### 3. UTILITY RAIL DERECHO (360px)
- **Scroll independiente**
- `overflow-y: auto`
- `overscroll-behavior: contain`
- Scrollbar sutil pero visible (5px, rgba(0,0,0,0.12))
- Contiene widgets apilados:
  - Música
  - Resumen de hoy
  - Tipos de trabajos (donut)
  - Tareas del día
  - (futuros widgets)

## Comportamiento por Resolución

### 1920×1080 (Desktop target)
- Home completo sin scroll de página
- Timeline ocupa espacio restante
- Utility Rail scrollea independientemente

### 1366×768 (Laptop)
- Workspace se comprime inteligentemente
- Timeline mantiene altura mínima funcional
- Recent Orders visible sin scroll general

### 2560×1440+ (Monitores grandes)
- Mismo layout, más espacio para Timeline
- Componentes NO se agrandan desproporcionadamente
- Timeline aprovecha ancho adicional

### Ultrawide (3440×1440, 5120×1440)
- Timeline muestra más semanas/días
- Sidebar y Utility Rail mantienen tamaño razonable
- No se escala toda la UI proporcionalmente

## Implementación Técnica

### Shell.tsx
```tsx
<div className="ambient-bg flex h-full relative">
  <aside className="... overflow-hidden"> {/* Sidebar fija */}
  <main className="... flex-1 overflow-hidden"> {/* Workspace */}
</div>
```

### Home.tsx
```tsx
<div className="flex h-full">
  <div className="flex-1 flex flex-col overflow-hidden"> {/* Workspace */}
    <header className="... flex-shrink-0"> {/* No se comprime */}
    <div className="... flex-shrink-0"> {/* Quick actions */}
    <div className="flex-1 ... overflow-hidden"> {/* Timeline crece */}
    <div className="... flex-shrink-0"> {/* Recent orders */}
  </div>
  <UtilityRail /> {/* Scroll independiente */}
</div>
```

### UtilityRail.tsx
```tsx
<aside className="... overflow-y-auto overscroll-contain scrollbar-thin">
  {/* Widgets apilados */}
</aside>
```

### CSS (index.css)
```css
.scrollbar-thin::-webkit-scrollbar { width: 5px; }
.scrollbar-thin::-webkit-scrollbar-thumb { 
  background: rgba(0,0,0,0.12); 
  border-radius: 3px; 
}
.scrollbar-thin { 
  scrollbar-width: thin; 
  scrollbar-color: rgba(0,0,0,0.12) transparent; 
}
```

## Reglas Críticas

✅ **HACER:**
- Usar `overflow: hidden` en contenedores principales
- Usar `flex-1` para elementos que deben crecer
- Usar `flex-shrink-0` para elementos que NO deben comprimirse
- Usar `overflow-y: auto` + `overscroll-behavior: contain` para scroll independiente
- Mantener scrollbar sutil pero visible en Utility Rail

❌ **NO HACER:**
- Permitir scroll general de página en desktop
- Usar `overflow-y: auto` en el workspace central
- Escalar toda la UI con `transform: scale()`
- Hacer que el scroll del Utility Rail mueva la página
- Crear layouts que requieran scroll en 1920×1080

## Testing

Verificar en:
- [ ] 1920×1080: Home completo sin scroll
- [ ] 1366×768: Workspace comprimido, sin scroll general
- [ ] Utility Rail: scroll independiente funciona
- [ ] Overscroll: scroll del rail no afecta sidebar/workspace
- [ ] Timeline: se expande para llenar espacio disponible
- [ ] Recent Orders: siempre visible sin scroll

## Estado Actual

✅ Implementado y funcional
✅ Build exitoso
✅ Scroll architecture preservada
✅ Utility Rail con scroll independiente
✅ Workspace sin scroll general en desktop
