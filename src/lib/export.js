import * as XLSX from 'xlsx';
import { formatCurrency } from './utils';

// Exportar inventario a PDF usando impresión nativa de Electron
export const exportInventoryToPDF = (products) => {
    // Crear una ventana temporal con el contenido a imprimir
    const printWindow = window.open('', '_blank');

    const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
    const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Inventario - ${new Date().toLocaleDateString('es-NI')}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #1e293b;
        }
        
        .header {
          margin-bottom: 30px;
          border-bottom: 3px solid #3b82f6;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 28px;
          color: #1e293b;
          margin-bottom: 8px;
        }
        
        .header .date {
          color: #64748b;
          font-size: 14px;
        }
        
        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }
        
        .stat-card .label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        
        .stat-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #1e293b;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        thead {
          background: #f1f5f9;
        }
        
        th {
          padding: 16px 12px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        td {
          padding: 16px 12px;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
        }
        
        tbody tr:hover {
          background: #f8fafc;
        }
        
        tbody tr:last-child td {
          border-bottom: none;
        }
        
        .sku {
          font-weight: 600;
          color: #1e293b;
        }
        
        .stock-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
        }
        
        .stock-low {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .stock-ok {
          background: #dcfce7;
          color: #166534;
        }
        
        .price {
          font-weight: 600;
          color: #1e293b;
        }
        
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: right;
        }
        
        .footer .total {
          font-size: 18px;
          font-weight: bold;
          color: #1e293b;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .stats {
            page-break-inside: avoid;
          }
          
          table {
            page-break-inside: auto;
          }
          
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📋 Inventario de Farmacia</h1>
        <div class="date">Generado el: ${new Date().toLocaleDateString('es-NI', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })}</div>
      </div>
      
      <div class="stats">
        <div class="stat-card">
          <div class="label">Total Productos</div>
          <div class="value">${products.length}</div>
        </div>
        <div class="stat-card">
          <div class="label">Valor Total</div>
          <div class="value">${formatCurrency(totalValue)}</div>
        </div>
        <div class="stat-card">
          <div class="label">Stock Bajo</div>
          <div class="value">${lowStockCount}</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>SKU</th>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Valor Total</th>
            <th>Vencimiento</th>
            <th>Proveedor</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(product => `
            <tr>
              <td class="sku">${product.sku}</td>
              <td>${product.name}</td>
              <td>${product.category}</td>
              <td>
                <span class="stock-badge ${product.stock <= product.minStock ? 'stock-low' : 'stock-ok'}">
                  ${product.stock}
                </span>
              </td>
              <td class="price">${formatCurrency(product.price)}</td>
              <td class="price">${formatCurrency(product.stock * product.price)}</td>
              <td>${product.expiryDate}</td>
              <td>${product.supplier}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <div class="total">Valor Total del Inventario: ${formatCurrency(totalValue)}</div>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Esperar a que se cargue y luego abrir el diálogo de impresión
    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
};

// Exportar inventario a Excel
export const exportInventoryToExcel = (products) => {
    // Preparar datos
    const data = products.map(product => ({
        'SKU': product.sku,
        'Producto': product.name,
        'Categoría': product.category,
        'Stock': product.stock,
        'Stock Mínimo': product.minStock,
        'Precio Unitario': product.price,
        'Valor Total': product.stock * product.price,
        'Proveedor': product.supplier,
        'Fecha Vencimiento': product.expiryDate,
    }));

    // Crear libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventario');

    // Ajustar ancho de columnas
    const columnWidths = [
        { wch: 12 }, // SKU
        { wch: 30 }, // Producto
        { wch: 18 }, // Categoría
        { wch: 8 },  // Stock
        { wch: 12 }, // Stock Mínimo
        { wch: 12 }, // Precio
        { wch: 12 }, // Valor Total
        { wch: 25 }, // Proveedor
        { wch: 15 }, // Vencimiento
    ];
    worksheet['!cols'] = columnWidths;

    // Guardar
    XLSX.writeFile(workbook, `inventario_${new Date().toISOString().split('T')[0]}.xlsx`);
};

// Exportar ventas a PDF
export const exportSalesToPDF = (sales, startDate, endDate) => {
    const printWindow = window.open('', '_blank');

    const totalSales = sales.reduce((sum, s) => sum + s.total, 0);

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Reporte de Ventas</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 40px;
          color: #1e293b;
        }
        .header {
          margin-bottom: 30px;
          border-bottom: 3px solid #22c55e;
          padding-bottom: 20px;
        }
        .header h1 { font-size: 28px; color: #1e293b; margin-bottom: 8px; }
        .header .period { color: #64748b; font-size: 14px; }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        thead { background: #f1f5f9; }
        th {
          padding: 16px 12px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #475569;
          text-transform: uppercase;
          border-bottom: 2px solid #e2e8f0;
        }
        td {
          padding: 16px 12px;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
        }
        .footer .summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        .summary-item {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
        }
        .summary-item .label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 5px;
        }
        .summary-item .value {
          font-size: 20px;
          font-weight: bold;
          color: #1e293b;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>💰 Reporte de Ventas</h1>
        <div class="period">Período: ${startDate} - ${endDate}</div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Productos</th>
            <th>Cantidad</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${sales.map(sale => `
            <tr>
              <td>${new Date(sale.createdAt).toLocaleDateString('es-NI')}</td>
              <td>${new Date(sale.createdAt).toLocaleTimeString('es-NI')}</td>
              <td>${sale.items.map(i => i.name).join(', ')}</td>
              <td>${sale.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
              <td style="font-weight: 600;">${formatCurrency(sale.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="footer">
        <div class="summary">
          <div class="summary-item">
            <div class="label">Total de Ventas</div>
            <div class="value">${formatCurrency(totalSales)}</div>
          </div>
          <div class="summary-item">
            <div class="label">Número de Transacciones</div>
            <div class="value">${sales.length}</div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
        setTimeout(() => {
            printWindow.print();
        }, 250);
    };
};

// Exportar ventas a Excel
export const exportSalesToExcel = (sales) => {
    const data = sales.map(sale => ({
        'Fecha': new Date(sale.createdAt).toLocaleDateString('es-NI'),
        'Hora': new Date(sale.createdAt).toLocaleTimeString('es-NI'),
        'Productos': sale.items.map(i => `${i.name} (${i.quantity})`).join(', '),
        'Cantidad Total': sale.items.reduce((sum, i) => sum + i.quantity, 0),
        'Total': sale.total,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

    worksheet['!cols'] = [
        { wch: 12 },
        { wch: 10 },
        { wch: 50 },
        { wch: 12 },
        { wch: 12 },
    ];

    XLSX.writeFile(workbook, `ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
};
