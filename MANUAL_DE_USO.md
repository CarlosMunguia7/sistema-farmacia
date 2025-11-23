# 📘 Manual de Uso - Sistema de Farmacia

Bienvenido al manual de usuario del Sistema de Inventario y Ventas para Farmacia. Esta guía explica de forma resumida y práctica cómo utilizar cada módulo del sistema.

---

## 1. 🏠 Dashboard (Panel Principal)
Es la pantalla de inicio que muestra un resumen general del negocio.

*   **Tarjetas de Estado**: Muestran el total de productos, ventas del mes, alertas de stock bajo y tendencia de ventas.
*   **Acciones Rápidas**: Botones para ir directamente a "Nueva Venta", "Agregar Producto" o "Ver Reportes".
*   **Actividad Reciente**: Lista de las últimas ventas realizadas en tiempo real.

---

## 2. 📦 Inventario
Aquí gestionas todos los medicamentos y productos.

### **Ejemplo: Agregar un Nuevo Producto**
1.  Haz clic en el botón **"+ Nuevo Producto"**.
2.  Llena el formulario con los datos:
    *   **Nombre**: `Amoxicilina 500mg`
    *   **SKU**: `MED-003` (Código único o de barras)
    *   **Categoría**: `Antibióticos`
    *   **Precio**: `45.00`
    *   **Stock**: `100`
    *   **Stock Mínimo**: `10` (El sistema avisará cuando baje de esta cantidad)
    *   **Vencimiento**: `2025-12-31`
3.  Haz clic en **"Guardar Producto"**.
4.  ¡Listo! El producto aparecerá en la lista y podrás buscarlo por nombre o código.

---

## 3. 🛒 Ventas (Punto de Venta)
El módulo principal para facturar a los clientes.

### **Ejemplo A: Venta de Contado**
1.  En el buscador de productos, escribe `Paracetamol` o escanea el código de barras.
2.  Haz clic en el producto o presiona `Enter` para agregarlo al carrito.
3.  Verás el producto en la lista derecha. Puedes ajustar la cantidad con los botones `+` y `-`.
4.  Haz clic en **"Completar Venta"**.
5.  El sistema confirmará la venta y descontará el stock automáticamente.

### **Ejemplo B: Venta a Crédito (Con Validación)**
1.  Agrega productos al carrito (ej. Total: `C$ 500.00`).
2.  En la parte superior, activa la casilla **"Venta a crédito"**.
3.  Busca al cliente en el campo "Buscar cliente..." (ej. `Juan Pérez`).
    *   *Nota: Si el cliente tiene un límite de crédito de C$ 400.00, el sistema bloqueará la venta y te mostrará una alerta indicando que excede su límite.*
4.  Si el cliente tiene saldo disponible, haz clic en **"Completar Venta"**.
5.  La venta se registra y se suma a la deuda del cliente.

---

## 4. 👥 Clientes
Gestión de la cartera de clientes y sus créditos.

### **Ejemplo: Registrar un Pago de Cliente**
1.  Ve al módulo de **Clientes**.
2.  Busca al cliente (ej. `Carlos`). Verás su saldo actual en rojo (ej. `C$ 1,200.00`).
3.  Haz clic en el botón verde **"$" (Registrar Pago)**.
4.  Ingresa el monto que el cliente está pagando (ej. `C$ 500.00`).
5.  Haz clic en **"Aceptar"**.
6.  El saldo del cliente se actualizará automáticamente (Nuevo saldo: `C$ 700.00`) y el pago quedará registrado en su historial.

---

## 5. 📊 Reportes y Finanzas
Control de caja y análisis de ganancias.

### **Ejemplo: Registrar un Egreso (Gasto)**
1.  Ve al módulo de **Reportes**.
2.  En la sección "Caja Diaria", haz clic en el botón rojo **"+ Egreso"**.
3.  Llena los datos del gasto:
    *   **Descripción**: `Pago de Luz` o `Compra a Proveedor X`
    *   **Monto**: `1500.00`
4.  Haz clic en **"Registrar"**.
5.  El sistema restará este monto del efectivo en caja y lo mostrará en el resumen del día.

### **Exportar Datos**
*   Usa los botones **"PDF"** o **"Excel"** en la parte superior para descargar el historial de ventas filtrado por fecha.

---

**Soporte Técnico**
Para cualquier problema técnico, contactar al administrador del sistema.
